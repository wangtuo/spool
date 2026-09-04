---
title: "eino 01 · schema：消息与流式的统一数据模型"
series: eino 源码分析
description: 所有组件流动的都是 schema.Message，而流式靠 StreamReader[T] 这个泛型原语。本篇读透 Message 结构、Pipe/Recv/Copy/Merge 的实现，以及 ConcatMessages 如何把增量 chunk 合并成完整消息。
tags: [eino, llm, go, 流式, 泛型]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

一个 LLM 框架里，数据在组件间流动时有两个绕不开的事实：

1. **数据的形状是「消息」**：用户输入、模型输出、工具调用结果，都是带角色、带内容、可能多模态、可能带 tool_call 的消息。
2. **数据的到达方式有两种**：要么一次性给全（非流式），要么一个 token 一个 chunk 地涌来（流式）。

eino 的做法是：用一个 `schema.Message` 统一数据形状，用一个泛型的 `schema.StreamReader[T]` 统一「流」这件事，再用一套 `Concat*` 函数规定「多个 chunk 怎么拼成一个完整值」。这三者都在 `schema/` 包里，是整个 compose 运行时的地基。

## 核心类型一：`schema.Message`

`Message` 是组件输入输出的通用载体（`schema/message.go`）。它不区分「请求消息」和「响应消息」，用同一个结构体靠 `Role` 和字段约定来表达：

{% highlight go %}
type Message struct {
    Role    RoleType `json:"role"`
    Content string   `json:"content"`        // 纯文本输入/输出

    // 多模态：用户输入用 UserInputMultiContent，模型生成用 AssistantGenMultiContent
    UserInputMultiContent    []MessageInputPart  `json:"user_input_multi_content,omitempty"`
    AssistantGenMultiContent []MessageOutputPart `json:"assistant_output_multi_content,omitempty"`

    Name string `json:"name,omitempty"`

    ToolCalls  []ToolCall `json:"tool_calls,omitempty"`  // 仅 assistant
    ToolCallID string     `json:"tool_call_id,omitempty"` // 仅 tool
    ToolName   string     `json:"tool_name,omitempty"`    // 仅 tool

    ResponseMeta     *ResponseMeta `json:"response_meta,omitempty"`
    ReasoningContent string        `json:"reasoning_content,omitempty"` // 推理模型的思考过程
    Extra            map[string]any `json:"extra,omitempty"`
}
{% endhighlight %}

角色用字符串常量而非枚举：

{% highlight go %}
type RoleType string
const (
    Assistant RoleType = "assistant"
    User      RoleType = "user"
    System    RoleType = "system"
    Tool      RoleType = "tool"
)
{% endhighlight %}

配套四个构造函数，把「什么角色该填哪些字段」编码进 API：

- `SystemMessage(content string) *Message`
- `UserMessage(content string) *Message`
- `AssistantMessage(content string, toolCalls []ToolCall) *Message`
- `ToolMessage(content, toolCallID string, opts ...ToolMessageOption) *Message`

值得注意的是 `ToolCall` 里有一个流式专属字段：

{% highlight go %}
type ToolCall struct {
    Index    *int         `json:"index,omitempty"` // 流式时标识这是第几个 tool_call 的分片
    ID       string       `json:"id"`
    Type     string       `json:"type"`
    Function FunctionCall `json:"function"` // Name + Arguments(JSON 字符串)
    Extra    map[string]any `json:"extra,omitempty"`
}
{% endhighlight %}

`Index` 是理解流式合并的钥匙——模型流式返回工具调用时，`Arguments` 是一段段 JSON 碎片拼出来的，`Index` 告诉你某片属于哪个工具调用。

## 核心类型二：`StreamReader[T]` 泛型流原语

`schema/stream.go` 定义了 eino 的流抽象。它不是接口，而是一个**带类型标签的结构体**，内部按 `readerType` 分派到五种实现：

{% highlight go %}
type StreamReader[T any] struct {
    typ readerType
    st  *stream[T]                 // 最基础的 channel 流
    ar  *arrayReader[T]            // 把切片当流读
    msr *multiStreamReader[T]      // 多路 fan-in
    srw *streamReaderWithConvert[T] // 带类型转换
    csr *childStreamReader[T]      // Copy 出来的子流
}

func (sr *StreamReader[T]) Recv() (T, error) {
    switch sr.typ {
    case readerTypeStream:      return sr.st.recv()
    case readerTypeArray:       return sr.ar.recv()
    case readerTypeMultiStream: return sr.msr.recv()
    case readerTypeWithConvert: return sr.srw.recv()
    case readerTypeChild:       return sr.csr.recv()
    }
}
{% endhighlight %}

消费方式是统一的 `Recv()` 循环，`io.EOF` 表示结束，且**必须 Close 一次**：

{% highlight go %}
defer sr.Close()
for {
    chunk, err := sr.Recv()
    if errors.Is(err, io.EOF) { break }
    if err != nil { return err }
    process(chunk)
}
{% endhighlight %}

### 最底层：`stream[T]` 是「单发送者 / 单接收者」的 channel

{% highlight go %}
func Pipe[T any](cap int) (*StreamReader[T], *StreamWriter[T]) {
    stm := newStream[T](cap)
    return stm.asReader(), &StreamWriter[T]{stm: stm}
}

type stream[T any] struct {
    items   chan streamItem[T] // chunk 和 error 都走这个 channel
    closed  chan struct{}      // 接收方提前退出时通知发送方
    automaticClose bool
}
{% endhighlight %}

`Send(chunk, err)` 把值和错误放在同一个 channel 里；`closeSend()` 关闭 items channel，接收方读到关闭后返回 `io.EOF`；`closeRecv()` 关闭 `closed`，让发送方从阻塞的 send 中解套。这是标准的 goroutine 管道模式，额外解决了「接收方提前 break，发送方永远阻塞泄漏」的问题。

### fan-out：`Copy(n)` 用链表 + `sync.Once` 实现一源多读

一个流只能被一个 goroutine 读（read-once）。要让同一份数据流向两个分支（比如一份给回调做 tracing、一份给下游节点），用 `Copy(n)`。

它的实现很精巧：父结构持有原流和 n 个「子流各自读到哪」的指针，每个元素是一个隐式链表节点 `cpStreamElement`：

{% highlight go %}
type cpStreamElement[T any] struct {
    once sync.Once
    next *cpStreamElement[T]
    item streamItem[T]
}

func (p *parentStreamReader[T]) peek(idx int) (T, error) {
    elem := p.subStreamList[idx]
    elem.once.Do(func() {        // 关键：只有第一个读到这里的子流真正去 Recv 原流
        t, err := p.sr.Recv()
        elem.item = streamItem[T]{chunk: t, err: err}
        if err != io.EOF {
            elem.next = &cpStreamElement[T]{}
            p.subStreamList[idx] = elem.next
        }
    })
    return elem.item.chunk, elem.item.err
}
{% endhighlight %}

`sync.Once` 保证：无论哪个子流先到达某个元素，底层 `Recv` 只发生一次，拿到的 chunk 写进节点后，其他子流读同一份。所有子流都 Close 后，父流才 Close 原流（`closedNum` 计数）。这是无锁的、懒拉取的 fan-out。

### fan-in：`MergeStreamReaders` 用 `reflect.Select` 多路复用

把多个上游流合成一个，靠 `multiStreamReader`。流数量少时用手写的 `receiveN`（编译期固定 select），超过 `maxSelectNum` 就退化为 `reflect.Select`：

{% highlight go %}
chosen, recv, ok := reflect.Select(msr.itemsCases) // 谁先来读谁
{% endhighlight %}

合并流在**所有**上游都 EOF 后才 EOF。还有一个 `MergeNamedStreamReaders` 变体：某个上游先结束时它不静默跳过，而是返回一个 `*SourceEOF` 错误（用 `GetSourceName(err)` 取出名字），让你能感知「是哪条流先结束了」。

### 转换：`StreamReaderWithConvert` 做跨类型流映射

compose 层常需要把 `StreamReader[*A]` 变成 `StreamReader[*B]`（比如节点输出类型和下游输入类型不同）。它包一层，逐个 `Recv` 后调 `convert`。两个细节：

- convert 返回哨兵 `ErrNoValue` → 该 chunk 被丢弃，继续读下一个（相当于流上的 filter）。
- `WithOnEOF` 可以在流结束时再塞一个值。

## 关键机制：`ConcatMessages` —— 流式 chunk 的合并语义

流只是「搬运」，真正让流式在业务上可用的是**合并规则**。模型流式吐回来的是一串「不完整的 Message」：每个 chunk 的 `Content` 是一小段文本、`ToolCalls` 是 JSON 碎片。怎么拼成完整消息？答案是 `ConcatMessages(msgs []*Message) (*Message, error)`。

它的规则（读源码逐条对应）：

1. **角色/标识必须一致**：所有 chunk 的 `Role`、`Name`、`ToolCallID`、`ToolName` 要么为空要么相同，冲突直接报错。
2. **文本累加**：`Content`、`ReasoningContent` 用 `strings.Builder` 顺序拼接。
3. **工具调用按 `Index` 归并**：交给 `concatToolCalls`——以 `*Index` 分组，同组的 `Function.Arguments` 字符串拼接（JSON 碎片重组），并校验 `ID/Type/Name` 一致，最后按 Index 排序。
4. **多模态分片合并**：连续的 text part 合并；非文本 part（图/音/视频）保持原样且每种类型只能出现在一个 chunk，否则报错。
5. **ResponseMeta 取「最大/最后」**：`Usage` 各 token 数取最大值（流式里 usage 常只在最后一个 chunk 给全），`FinishReason` 取最后一个非空值。

还有一个便捷函数把「 drain 流 + 合并」一步到位：

{% highlight go %}
func ConcatMessageStream(s *StreamReader[*Message]) (*Message, error) {
    defer s.Close()
    var msgs []*Message
    for {
        msg, err := s.Recv()
        if err == io.EOF { break }
        if err != nil { return nil, err }
        msgs = append(msgs, msg)
    }
    return ConcatMessages(msgs)
}
{% endhighlight %}

### 合并函数是怎么被框架找到的？

注意 `message.go` 的 `init()`：

{% highlight go %}
func init() {
    internal.RegisterStreamChunkConcatFunc(ConcatMessages)
    internal.RegisterStreamChunkConcatFunc(ConcatMessageArray)
    internal.RegisterStreamChunkConcatFunc(ConcatAgenticMessages)
    internal.RegisterStreamChunkConcatFunc(ConcatToolResults)
    // ...
}
{% endhighlight %}

eino 维护了一个「类型 → 合并函数」的注册表。compose 运行时在需要把流「收集」成整值（后面讲 `Collect` 模式时会用到）时，按 chunk 的类型查表拿到对应的 concat 函数。这就是为什么**自定义类型只要注册一个 concat 函数，就能自动获得流式拼装能力**——框架不认识你的类型，但认识「怎么拼它」。

## 设计取舍

- **流用具体结构体 + 类型标签分派，而不是接口**：`StreamReader[T]` 对外暴露的是具体类型，五种内部实现藏在 `typ` 后面。好处是泛型 API 对用户极简（永远是 `Recv/Close/Copy`），内部又能为 channel/数组/多路/转换/子流分别优化；代价是 `Recv/Close/toStream` 里各有一个 `switch typ`，加新流类型要改多处。
- **read-once + 显式 Close**：强制单消费者、必须关闭，把「流泄漏」变成编译/约定层面能约束的事；`SetAutomaticClose` 用 `runtime.SetFinalizer` 兜底，但注释明确说它不是并发安全的、只是补救。
- **合并逻辑与流传输解耦**：`StreamReader` 只管搬字节/值，「怎么拼」交给 `Concat*` + 注册表。这让流式/非流式能共用同一套节点抽象（第 06 篇会看到运行时如何据此自动在整值和流之间转换）。
- **多模态合并偏保守**：非文本 part 不允许跨 chunk 重复出现，宁可报错也不猜，避免把两份图片静默拼错。

## 自己动手

- [ ] 在 eino 里写个最小例子：`sr, sw := schema.Pipe[*schema.Message](3)`，一个 goroutine 分 3 次 `Send` 内容分别为 `"Hel"`、`"lo"`、`" world"` 的 assistant chunk，主 goroutine 用 `schema.ConcatMessageStream(sr)` 收回，打印 `Content`，应为 `Hello world`。
- [ ] 造两个带 `ToolCall{Index: &i}` 的 chunk，让 `Function.Arguments` 分别是 `{"city": "` 和 `Beijing"}`，观察 `ConcatMessages` 拼出完整 JSON。
- [ ] 用 `sr.Copy(2)` 拉出两个子流，在两个 goroutine 里各自 `Recv` 计数，验证两边收到的元素数相同且底层 `Recv` 次数等于元素数（在 `peek` 的 `once.Do` 里打印验证）。

---

*上一篇：[00 · 开篇：eino 想解决什么问题]({{ site.baseurl }}{% post_url 2026-09-02-eino-00-why-eino %}) · 下一篇：02 · components —— 组件接口的抽象哲学。*
