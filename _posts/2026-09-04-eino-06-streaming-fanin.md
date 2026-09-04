---
title: "eino 06 · 运行时（下）：流式 fan-in / fan-out 与 Pregel channel"
series: eino 源码分析
description: 流式下一个节点的输出要同时喂给多个下游（fan-out），多个上游的流要汇成一个（fan-in）。本篇读 StreamReader.copy 的扇出、pregelChannel.get 的单值直通与多值 mergeValues 汇合，以及 DAG channel 的全前驱等待，看 eino 怎么用同一套 channel 抽象统一流式与非流式。
tags: [eino, llm, go, compose, streaming, fan-in, pregel, channel]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

上一篇看的是非流式 `Invoke`，值是「一个完整对象」，fan-out 就是把同一个指针多传几份，fan-in 就是等几个对象凑齐。流式下事情变麻烦：

- **fan-out**：一个模型节点**边生成边输出** token 流，这条流要同时喂给两个下游（比如一个做解析、一个做日志）。流不能像值那样共享一个 reader——一个下游 `Recv` 走了，另一个就没了。需要把一条流「复制」成多条独立可读的流。
- **fan-in**：两个节点并发各自产出一条流，要汇成一条流喂给下游。什么时候开始喂？谁先到先读谁？EOF 怎么处理？
- **触发时机**：非流式 Pregel「来一个值就触发」，流式下也一样吗？DAG 的「等齐所有前驱」在流式下又是什么意思？

eino 把这些全部收进 `channel` 抽象和 `StreamReader` 的两个原语（`copy` / `merge`）里。这一篇看它们怎么协作。

## fan-out：copyItem 与 StreamReader.copy

上一篇 `resolveCompletedTasks` 里，一个节点完成后要把输出分给若干下游，用的是 `copyItem`：

{% highlight go %}
func copyItem(item any, n int) []any {
    if n < 2 {
        return []any{item}
    }
    ret := make([]any, n)
    if s, ok := item.(streamReader); ok {
        ss := s.copy(n)          // 流式：把一条流复制成 n 条
        for i := range ret {
            ret[i] = ss[i]
        }
        return ret
    }
    for i := range ret {         // 非流式：同一个值传 n 份
        ret[i] = item
    }
    return ret
}
{% endhighlight %}

分叉点就在这：**非流式值直接共享，流式必须 `copy`**。`StreamReader[T]` 的 `copy(n)` 内部起一组转发 goroutine，把源头的每个 chunk  fan-out 到 n 个独立 reader（`schema/stream.go` 的 `copyStreamReaders`）：

{% highlight go %}
func copyStreamReaders[T any](sr *StreamReader[T], n int) []*StreamReader[T] {
    // 源头 Recv 到一个 chunk，分别 Send 给 n 个副本 reader；
    // 任一副本 Close 不影响其他副本；源头在所有副本都结束后关闭。
}
{% endhighlight %}

所以「一个模型输出同时给两个下游」在运行时就是：模型产出一条 `StreamReader[*schema.Message]`，`copyItem` 把它 `copy(2)`，两条独立的流分别写进两个下游节点的 channel。每个下游按自己的节奏 `Recv`，互不干扰。这也解释了第 07 篇会讲的：**callback 想读流也得 copy 一份**，因为流不能被旁路「偷看」。

## fan-in 的入口：pregelChannel.get

Pregel 模式下每个节点的 channel 是 `pregelChannel`，核心就是一个 `Values map[来源节点]值`：

{% highlight go %}
type pregelChannel struct {
    Values      map[string]any
    mergeConfig FanInMergeConfig
}
{% endhighlight %}

上游每完成一个，就往 `Values[来源key]` 里塞一个值（流式下塞的是一条 StreamReader）。`get` 决定「这个节点现在要不要触发、拿什么去触发」：

{% highlight go %}
func (ch *pregelChannel) get(isStream bool, name string, edgeHandler *edgeHandlerManager) (any, bool, error) {
    if len(ch.Values) == 0 {
        return nil, false, nil          // 还没有任何上游产出，不就绪
    }
    defer func() { ch.Values = map[string]any{} }()   // 取走后清空，准备下一轮（环）

    values := make([]any, len(ch.Values))
    names := make([]string, len(ch.Values))
    i := 0
    for k, v := range ch.Values {
        // 先过边上映射 handler（第 04 篇的 handlerOnEdges）
        resolvedV, err := edgeHandler.handle(k, name, v, isStream)
        if err != nil { return nil, false, err }
        values[i] = resolvedV
        names[i] = k
        i++
    }

    if len(values) == 1 {
        return values[0], true, nil     // 只有一个来源：直通，不合并
    }

    // 多个来源：fan-in 合并
    mergeOpts := &mergeOptions{
        streamMergeWithSourceEOF: ch.mergeConfig.StreamMergeWithSourceEOF,
        names:                    names,
    }
    v, err := mergeValues(values, mergeOpts)
    return v, true, nil
}
{% endhighlight %}

两个要点：

1. **来一个值就 ready**（`len(ch.Values) > 0` 即触发）。这就是 Pregel 的 AnyPredecessor 语义——不等所有上游，谁先到谁触发。环图里节点会被反复触发，靠的是 `get` 取走后 `defer` 把 `Values` 清空，下一轮重新累积。
2. **单值直通、多值才 merge**。一个节点只有一个上游时（最常见的链式），零合并开销；只有真正 fan-in（多上游同时到达）才走 `mergeValues`。

## mergeValues：fan-in 怎么合

{% highlight go %}
func mergeValues(vs []any, opts *mergeOptions) (any, error) {
    v0 := reflect.ValueOf(vs[0])
    t0 := v0.Type()

    if fn := internal.GetMergeFunc(t0); fn != nil {
        return fn(vs)                    // 用户/内置为该类型注册的合并函数
    }

    // 合并 StreamReader
    if s, ok := vs[0].(streamReader); ok {
        t := s.getChunkType()
        if internal.GetMergeFunc(t) == nil {
            return nil, fmt.Errorf("(mergeValues | stream type) unsupported chunk type: %v", t)
        }
        ss := make([]streamReader, len(vs)-1)
        for i := 0; i < len(ss); i++ {
            sri, ok_ := vs[i+1].(streamReader)
            // ... 校验每条流的 chunk 类型一致
            ss[i] = sri
        }
        if opts != nil && opts.streamMergeWithSourceEOF {
            return s.mergeWithNames(ss, opts.names), nil
        }
        return s.merge(ss), nil          // 多条流汇成一条
    }

    return nil, fmt.Errorf("(mergeValues) unsupported type: %v", t0)
}
{% endhighlight %}

分两种情况：

- **非流式值 fan-in**：查这个类型有没有注册 merge 函数（`RegisterValuesMergeFunc[T]`）。比如 `map[K]V` 内置了按 key 合并的默认实现。没注册就报错——eino 不猜你想怎么合两个结构体。
- **流式 fan-in**：值本身是 StreamReader，取它的 **chunk 类型** `T` 查 merge 函数（决定 chunk 之间怎么拼，比如 `*schema.Message` 的 concat），然后调 `s.merge(ss)` 把多条流汇成一条逻辑流。`merge` 内部公平地从各条源流拉 chunk，谁有就转发谁，所有源流 EOF 后合并流才 EOF。

`streamMergeWithSourceEOF` / `mergeWithNames` 是给需要「区分这个 chunk 来自哪个上游」的场景用的（合并时带上来源名），默认不带。

所以 fan-in 的本质是：**channel 攒齐当前轮到达的流，用 `StreamReader.merge` 拼成一条，再交给节点**。节点完全无感——它看到的还是一条普通的输入流。

## 对照：DAG channel 的「等齐」

DAG 模式换成 `dagChannel`，它显式记录每个前驱的状态：

{% highlight go %}
type dependencyState uint8
const (
    dependencyStateWaiting dependencyState = iota
    dependencyStateReady
    dependencyStateSkipped
)

type dagChannel struct {
    ControlPredecessors map[string]dependencyState
    DataPredecessors    map[string]bool   // 数据前驱是否已到
    Values              map[string]any
    Skipped             bool
    // ...
}
{% endhighlight %}

`reportValues` 标记数据前驱到了，`reportDependencies` 标记控制前驱就绪，`reportSkip` 标记某个前驱被分支跳过。`get` 的就绪条件是：**所有控制前驱都到达终态（ready 或 skipped），且数据前驱该到的都到了**——这就是 AllPredecessor。全齐后才把 `Values` 合并成一个值触发一次。被跳过的前驱不计入等待，所以「分支选了 A 没选 B」不会让节点永远等下去。

对比下来：

| | Pregel channel | DAG channel |
|---|---|---|
| 触发条件 | 任一上游到值即触发 | 所有前驱到齐（或跳过）才触发 |
| 环 | 允许（`get` 后清空 Values 进入下一轮） | 禁止（编译期环检测） |
| fan-in | 单值直通，多值 merge | 必然等齐后一次性 merge |
| 典型场景 | Agent 循环、低延迟流式 | 并行检索后汇聚、确定性 workflow |

## 流式与非流式为什么能共用一套

回看整个设计，`isStream` 只在很少几个地方分叉：

- `copyItem`：值共享 vs 流 `copy`；
- `mergeValues`：调类型 merge 函数 vs 调 `StreamReader.merge`；
- 分支求值：`branch.invoke`（值）vs `branch.collect`（流先 concat）；
- edge/preNode handler：`v.invoke(value)` vs `v.transform(streamReader)`。

其余调度逻辑（主循环、submit/wait、channel 就绪判断、前驱映射）**完全不区分流式与否**。channel 里存的 `any`，流式时是 StreamReader、非流式时是普通值，channel 接口本身不关心。这就是第 01 篇讲的「StreamReader 把流也变成一种可以被传递、复制、合并的一等值」在调度层的兑现——**流和值走同一张图、同一套邮箱，只在边界处用 copy/merge 两个原语补差**。

## 设计取舍

- **fan-out 用 copy（goroutine 转发）而非共享 reader**：换来下游之间完全解耦、可独立 Close、可不同节奏消费；代价是每个扇出边多一组 goroutine 和缓冲。callback 读流也因此必须 copy 并负责 Close（第 07 篇）。
- **fan-in 单值直通、多值才 merge**：链式场景零开销，只有真汇聚才付合并成本；合并策略交给类型注册的 merge 函数，框架不擅自定义「两个结构体怎么合」。
- **Pregel 来值即触发 + 取后清空**：天然支持环和低流式延迟，代价是同一节点可能被多个上游各触发一次（语义上需要用户自己保证幂等或用 DAG）。
- **DAG 显式三态前驱（waiting/ready/skipped）**：用更多状态换来「等齐」和「分支跳过不致死锁」的确定性，代价是不支持环。

## 自己动手

- [ ] 造一个模型节点扇出到两个 Lambda 节点的图，用 `Stream` 跑，在两个 Lambda 里各自 `Recv` 打印，确认两条流都能拿到完整 token（而不是各拿一半）。
- [ ] 给 fan-in 节点的输入类型用一个**没注册 merge 函数**的自定义 struct，非流式 fan-in，观察 `unsupported type` 报错；再用 `compose.RegisterValuesMergeFunc` 注册一个合并函数重试。
- [ ] 同一个 fan-in 图分别用默认 Pregel 和 `WithNodeTriggerMode(AllPredecessor)` 跑，在汇聚节点入口打印触发次数，对比「触发多次」与「触发一次」。
- [ ] 在 DAG 图里让某分支条件跳过一个前驱，确认汇聚节点不会因为等不到那个前驱而挂死。

---

*上一篇：[05 · 运行时（上）：Invoke 调用链与任务调度循环]({{ site.baseurl }}{% post_url 2026-09-04-eino-05-runtime-invoke %}) · 下一篇：07 · callbacks：横切关注点的切面机制。*
