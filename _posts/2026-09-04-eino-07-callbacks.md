---
title: "eino 07 · callbacks：横切关注点的切面机制"
series: eino 源码分析
description: 日志、追踪、指标、token 统计这些「每个组件都要做、又和业务无关」的事，eino 用 callbacks 切面统一处理。本篇读 Handler 的五个时机、RunInfo/CallbackInput 类型别名、全局 handler 与单次 handler 的两层叠加，以及流式 callback 为什么必须 copy 流并负责 Close。
tags: [eino, llm, go, callbacks, aop, observability, streaming]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

LLM 应用有大量横切关注点：每次调模型要记 prompt 和输出、算 token、打 trace span、算耗时；工具调用要审计；出错要上报。这些逻辑：

- **每个组件都要**，但和组件本身的业务（生成、检索、调用工具）无关；
- 不应该让用户在每个节点里手写一遍日志；
- 流式下还要能拿到「正在产出的流」去做实时统计。

传统做法是 middleware / decorator 包一层。但 eino 的组件接口有 4 个方法（Invoke/Stream/Collect/Transform）、图里还有几十种组件，逐个包成本高。eino 的选择是 **callback 切面**：组件在自己执行的固定时机「广播」事件，用户注册 handler 来响应。handler 通过 **context** 传递，对业务代码零侵入。

## Handler：五个时机

`callbacks/interface.go` 把 `Handler` 定义为内部接口的别名，五个方法对应五个生命周期时机：

{% highlight go %}
type Handler interface {
    OnStart(ctx context.Context, info *RunInfo, input CallbackInput) context.Context
    OnEnd(ctx context.Context, info *RunInfo, output CallbackOutput) context.Context
    OnError(ctx context.Context, info *RunInfo, err error) context.Context

    OnStartWithStreamInput(ctx context.Context, info *RunInfo,
        input *schema.StreamReader[CallbackInput]) context.Context
    OnEndWithStreamOutput(ctx context.Context, info *RunInfo,
        output *schema.StreamReader[CallbackOutput]) context.Context
}
{% endhighlight %}

对应五个时机常量：

{% highlight go %}
const (
    TimingOnStart              CallbackTiming = iota // 组件开始处理前，拿到完整输入值
    TimingOnEnd                                      // 组件成功返回后，拿到输出值（出错不触发）
    TimingOnError                                    // 组件返回 error（流中途的 panic 不走这，体现在流里）
    TimingOnStartWithStreamInput                     // Collect/Transform：输入是流
    TimingOnEndWithStreamOutput                      // Stream/Transform：输出是流
)
{% endhighlight %}

关键设计：**方法返回 `context.Context`**。同一个 handler 的 `OnStart` 返回的 ctx 会传给它自己的 `OnEnd`/`OnError`，于是 handler 可以在 `OnStart` 里把一个 span / 计时器塞进 ctx，在 `OnEnd` 里取出来结束。但**不同 handler 之间、ctx 不互相流转，也没有执行顺序保证**——文档明确警告不要依赖 handler 顺序。

五个方法不用全实现。`NewHandlerBuilder` 只设你关心的时机，生成的 handler 会自动实现 `TimingChecker`：

{% highlight go %}
type TimingChecker interface {
    Needed(ctx context.Context, info *RunInfo, timing CallbackTiming) bool
}
{% endhighlight %}

框架在每次调用组件前问一句「这个时机你要不要？」，不要就**跳过流 copy 和 goroutine 分配**。这对性能很关键——流式 callback 要把输出流复制一份给 handler（见下），没注册流回调时这笔开销必须省掉。

## RunInfo 与类型化的 Input/Output

handler 怎么知道「现在在跑哪个组件、是哪个节点」？靠 `RunInfo`：

{% highlight go %}
type RunInfo struct {
    Name      string               // 业务名：图里是节点名（WithNodeName）
    Type      string               // 实现标识，如 "OpenAI"（组件 Typer，反射兜底）
    Component components.Component // 组件类别，如 ComponentOfChatModel / Lambda / Graph
}
{% endhighlight %}

`Component` 用来判断「这是哪类组件」而不关心具体实现；`Type` 用来判断具体实现；`Name` 用来在 trace 里定位节点。

`CallbackInput`/`CallbackOutput` 本质是 `any` 的别名，**具体类型由组件定义**。比如 ChatModel 的回调里是 `*model.CallbackInput`（含 Messages）。handler 用组件包提供的 `ConvCallbackXxx` 安全转换，不匹配返回 nil 直接跳过：

{% highlight go %}
modelInput := model.ConvCallbackInput(in)
if modelInput == nil {
    return ctx // 不是模型调用，忽略
}
log.Printf("prompt: %v", modelInput.Messages)
{% endhighlight %}

用别名 + 组件自己的 Conv 函数，而不是在核心接口里塞一个大而全的 Input struct，是为了让核心包不依赖任何具体组件类型，同时每个组件能带自己丰富的回调数据。

## 两层 handler：全局 vs 单次

handler 有两个来源：

**1. 进程级全局 handler**，程序初始化时注册，对所有图、所有节点生效：

{% highlight go %}
// Deprecated: 用 AppendGlobalHandlers
func InitCallbackHandlers(handlers []Handler) { callbacks.GlobalHandlers = handlers }

func AppendGlobalHandlers(handlers ...Handler) {
    callbacks.GlobalHandlers = append(callbacks.GlobalHandlers, handlers...)
}
{% endhighlight %}

适合分布式追踪、全局 metrics 这类「必须观察到每一次调用」的埋点。注意它**不是线程安全**的，要求在 `main`/`TestMain` 里、任何图执行之前调一次。

**2. 单次调用 handler**，通过 `compose.WithCallbacks(...)` 作为 option 传给某次 `Invoke`/`Stream`，只对这一次运行生效。

运行时，第 05 篇看到的 `initNodeCallbacks` 在每个节点执行前，把这个节点的 `RunInfo` 和「全局 handler + 本次 handler」通过 `InitCallbacks`/`AppendHandlers` 装进 ctx：

{% highlight go %}
func AppendHandlers(ctx context.Context, info *RunInfo, handlers ...Handler) context.Context {
    cbm, ok := managerFromCtx(ctx)
    if !ok {
        return InitCallbacks(ctx, info, handlers...)
    }
    nh := make([]Handler, len(cbm.handlers)+len(handlers))
    copy(nh[:len(cbm.handlers)], cbm.handlers)        // 全局/父级在前
    copy(nh[len(cbm.handlers):], handlers)            // 本次在后
    return InitCallbacks(ctx, info, nh...)
}
{% endhighlight %}

全局 handler 排在前面（先执行），单次 handler 追加在后。组件内部真正触发时机时，`callbacks.On[...]` 从 ctx 取出 manager，遍历 handlers 逐个调用。

## 组件怎么触发：四模式包装

handler 注册了，但谁在什么时刻调 `OnStart`/`OnEnd`？答案在 `runnable.go` 的 `newRunnablePacker`——当启用 callback 时，用户提供的四个函数会被各自包一层：

{% highlight go %}
if enableCallback {
    if i != nil { i = invokeWithCallbacks(i) }
    if s != nil { s = streamWithCallbacks(s) }
    if c != nil { c = collectWithCallbacks(c) }
    if t != nil { t = transformWithCallbacks(t) }
}
{% endhighlight %}

以 `invokeWithCallbacks` 为例（语义）：执行前触发 `OnStart`（拿到输入值），执行后成功触发 `OnEnd`（拿到输出值）、失败触发 `OnError`。流式的 `streamWithCallbacks` 则在返回流之前触发 `OnEndWithStreamOutput`——**注意它拿到的是输出流的一份副本**。

这里就接上了第 06 篇的 fan-out 原语：流只能被消费一次，业务代码要读这条流，handler 也想读这条流做统计，怎么办？框架在流式时机把流 `copy` 一份，原件给业务、副本给 handler。因此文档反复强调：

> Stream handlers receive a StreamReader that has already been copied; they **MUST close their copy** after reading. If any handler's copy is not closed, the original stream cannot be freed, causing a goroutine/memory leak.

这也解释了 `TimingChecker` 为什么重要：没注册流回调时，`Needed` 返回 false，框架连这份 copy 都不做，省掉一组转发 goroutine。

还有一条约束：**不要在 handler 里修改 Input/Output**。所有下游节点和 handler 共享同一个指针（直接赋值，非深拷贝），并发图里改它会 data race。handler 是只读观察者。

## 一次带回调的流式调用

串起来，`graph.Stream(ctx, input, compose.WithCallbacks(traceHandler))`：

1. 主循环跑到模型节点，`execute` 调 `initNodeCallbacks`，把 `RunInfo{Name:"chat", Component:ComponentOfChatModel}` 和全局 handler + `traceHandler` 装进 ctx。
2. 模型的 `streamWithCallbacks` 包装层：先触发 `OnStartWithStreamInput`/`OnStart`（若 handler 需要）；调用模型拿到输出流。
3. 因为输出是流，把流 copy 一份：原件作为节点产出进入 fan-out/channel；副本传给 `traceHandler.OnEndWithStreamOutput`，handler 边读边统计 token，读完 Close。
4. 流正常结束（或中途 error）对应触发 OnEnd / 流内 error。
5. `traceHandler` 在 `OnStart` 塞进 ctx 的 span，在自己的 `OnEnd` 里取出结束。

业务代码（模型、图、节点函数）完全不知道 trace 的存在。

## 设计取舍

- **切面靠 context 传播而非显式参数**：业务函数签名保持干净，组件不用知道有没有人监听；代价是 handler 的发现是隐式的，调试时要顺着 ctx 看。
- **五时机覆盖四模式**：非流式用 OnStart/OnEnd/OnError，流式额外两个带流时机，统一了 Invoke/Stream/Collect/Transform 的可观测性，不用为每个模式写一套中间件。
- **类型擦除（CallbackInput=any）+ 组件 Conv 函数**：核心包不依赖具体组件，各组件带自定义回调数据；代价是 handler 里要做一次类型断言（Conv 返回 nil 即跳过）。
- **流副本 + 必须 Close + TimingChecker**：流式可观测的代价是 copy 开销，用「没注册就不 copy」把成本降到只在真正需要时付出；但把「必须 Close 否则泄漏」的纪律交给了 handler 作者。
- **全局 handler 非线程安全、需初始化期注册**：换取运行时无锁读取，简单且快。

## 自己动手

- [ ] 用 `callbacks.NewHandlerBuilder` 只设 `OnStart` 和 `OnEnd`，打印 `info.Name`/`info.Component`，跑一条三节点 Chain，观察每个节点各触发一次。
- [ ] 给 `Stream` 调用注册一个 `OnEndWithStreamOutput` handler，在里边 `Recv` 累计 chunk 数并 **Close**；故意不 Close，用 `runtime.NumGoroutine()` 观察 goroutine 泄漏。
- [ ] 在 `OnStart` 里用 `context.WithValue` 塞一个开始时间，在 `OnEnd` 里取出来算耗时，验证同一 handler 的 ctx 是贯通的。
- [ ] 同时注册一个全局 `AppendGlobalHandlers` 和一个 `WithCallbacks` 单次 handler，对比两者在一次调用中的触发情况；让 handler 实现 `TimingChecker.Needed` 对流时机返回 false，确认流不被 copy。

---

*上一篇：[06 · 运行时（下）：流式 fan-in / fan-out 与 Pregel channel]({{ site.baseurl }}{% post_url 2026-09-04-eino-06-streaming-fanin %}) · 下一篇：08 · Lambda：把普通函数变成图节点。*
