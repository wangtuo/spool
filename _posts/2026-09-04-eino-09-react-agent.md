---
title: "eino 09 · 实战：ReAct Agent 是怎么用图搭出来的"
series: eino 源码分析
description: 前八篇的机制在这一篇收口。ReAct Agent 不是什么特殊运行时，而就是一张带环的 Graph：chat 模型节点 + tools 工具节点 + 两个分支条件 + 本地状态。本篇读 flow/agent/react 的 NewAgent，看模型/工具节点怎么连、分支怎么决定「调工具还是结束」、状态怎么累积消息、ToolReturnDirectly 怎么短路。
tags: [eino, llm, go, agent, react, graph, tool-calling]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

ReAct 是最经典的 Agent 范式：模型一边推理（Reason）一边行动（Act）——它决定要不要调工具，工具结果喂回去，模型再决定继续调还是给出最终答案。这个「模型 → 工具 → 模型 → … → 结束」的循环，很多框架要用专门的 Agent 运行时。

eino 的做法很能体现整套架构的意图：**ReAct Agent 就是一张带环的 Graph**，用的全是前面讲过的原语——节点、边、分支、本地状态、Pregel 环、Lambda、四模式流式。`flow/agent/react/react.go` 里的 `NewAgent` 本质是个「建图函数」。看懂它，就看懂了 eino 编排能力的上限。

先明确：ReAct 在 **eino 主仓库**（`flow/agent/react`），不在 eino-ext。

## AgentConfig：搭图需要的材料

{% highlight go %}
type AgentConfig struct {
    ToolCallingModel model.ToolCallingChatModel // 支持 tool calling 的模型（首选）
    Model            model.ChatModel            // 已废弃，普通模型兜底
    ToolsConfig      compose.ToolsNodeConfig    // 工具集合
    MessageModifier  MessageModifier            // 调模型前改消息（如加 system prompt）
    MessageRewriter  MessageModifier            // 更早一步改写历史
    MaxStep          int                        // 最大循环步数
    ToolReturnDirectly map[string]struct{}      // 哪些工具的结果直接返回、不再回模型
    StreamToolCallChecker func(ctx, *schema.StreamReader[*schema.Message]) (bool, error)
    GraphName, ModelNodeName, ToolsNodeName string
}
{% endhighlight %}

两个节点 key 是固定常量：

{% highlight go %}
nodeKeyTools = "tools"
nodeKeyModel = "chat"
{% endhighlight %}

## 建图：两个节点 + 一个环

`NewAgent` 的核心就是下面这段（省略错误处理）：

{% highlight go %}
graph := compose.NewGraph[[]*schema.Message, *schema.Message](
    compose.WithGenLocalState(func(ctx context.Context) *state {
        return &state{Messages: make([]*schema.Message, 0, config.MaxStep+1)}
    }))

// 模型节点：前置 handler 把新输入累积进 state，再（经 modifier）喂给模型
graph.AddChatModelNode(nodeKeyModel, chatModel,
    compose.WithStatePreHandler(modelPreHandle),
    compose.WithNodeName(modelNodeName))

graph.AddEdge(compose.START, nodeKeyModel)   // 入口直接进模型

// 工具节点：前置 handler 把模型输出（含 tool_calls 的 assistant 消息）记进 state
graph.AddToolsNode(nodeKeyTools, toolsNode,
    compose.WithStatePreHandler(toolsNodePreHandle),
    compose.WithNodeName(toolsNodeName))

// 模型之后的分支：有 tool_calls → tools；否则 → END
modelPostBranchCondition := func(ctx context.Context, sr *schema.StreamReader[*schema.Message]) (string, error) {
    isToolCall, err := toolCallChecker(ctx, sr)
    if err != nil { return "", err }
    if isToolCall { return nodeKeyTools, nil }
    return compose.END, nil
}
graph.AddBranch(nodeKeyModel,
    compose.NewStreamGraphBranch(modelPostBranchCondition,
        map[string]bool{nodeKeyTools: true, compose.END: true}))
{% endhighlight %}

图的形状是：

```
START → chat ──branch──→ tools ──(回到 chat)
            └────────→ END
```

注意 `tools` 节点跑完后**有一条边回到 chat**（在 `buildReturnDirectly` 里，见下）。这就是环——第 04 篇说的 Pregel 允许环，正好用在这。

### 为什么用 NewStreamGraphBranch

分支条件收的是 `*schema.StreamReader[*schema.Message]`——因为模型输出可能是流式的。`NewStreamGraphBranch` 让条件函数拿到流，内部用 `branch.collect`（第 05 篇：流式分支先 concat 成值再判断）。`toolCallChecker` 默认是 `firstChunkStreamToolCallChecker`：看模型输出的第一个 chunk 带不带 tool_calls，就能决定路由（不用等整条流完，降低延迟）。

白名单 `{tools: true, END: true}` 是第 03 篇讲的 endNodes 约束：分支只能返回这两个目标，返回别的编译/运行期报错。

## 本地状态：消息历史累积

Agent 要记住「到目前为止的完整对话」。eino 用**图本地状态**（`WithGenLocalState`）而不是让节点自己维护全局变量：

{% highlight go %}
type state struct {
    Messages                []*schema.Message
    ReturnDirectlyToolCallID string
}
{% endhighlight %}

每次运行 `stateGenerator` 造一份新 state（第 04 篇 `runCtx`），通过 context 传递，天然并发安全、运行间隔离。

模型节点的 `modelPreHandle` 负责累积和改写：

{% highlight go %}
modelPreHandle := func(ctx context.Context, input []*schema.Message, state *state) ([]*schema.Message, error) {
    state.Messages = append(state.Messages, input...)   // 新输入追加进历史

    if config.MessageRewriter != nil {
        state.Messages = config.MessageRewriter(ctx, state.Messages)  // 先改写
    }
    if messageModifier == nil {
        return state.Messages, nil
    }
    modifiedInput := make([]*schema.Message, len(state.Messages))
    copy(modifiedInput, state.Messages)
    return messageModifier(ctx, modifiedInput), nil    // 再修饰（不污染原历史）
}
{% endhighlight %}

这正是第 05 篇 `preNodeHandlerManager` 在 channel 出值后调用的那个 preHandler。注意 modifier 作用在**副本**上，原始 `state.Messages` 保留——这样 modifier（比如临时塞 system prompt）不会污染历史。

工具节点的 `toolsNodePreHandle` 把模型那条带 tool_calls 的 assistant 消息也记进历史，并判断这次调用的工具是不是「直接返回」：

{% highlight go %}
toolsNodePreHandle := func(ctx context.Context, input *schema.Message, state *state) (*schema.Message, error) {
    if input == nil {
        return state.Messages[len(state.Messages)-1], nil // checkpoint 恢复场景
    }
    state.Messages = append(state.Messages, input)
    state.ReturnDirectlyToolCallID = getReturnDirectlyToolCallID(input, config.ToolReturnDirectly)
    return input, nil
}
{% endhighlight %}

## 编译：AnyPredecessor + MaxRunSteps

建完图，编译选项把前几篇的开关都用上了：

{% highlight go %}
compileOpts := []compose.GraphCompileOption{
    compose.WithMaxRunSteps(config.MaxStep),          // 环兜底：防死循环
    compose.WithNodeTriggerMode(compose.AnyPredecessor), // Pregel：来值即触发
    compose.WithGraphName(graphName),
}
runnable, err := graph.Compile(ctx, compileOpts...)
{% endhighlight %}

- `AnyPredecessor`：显式选 Pregel 语义（虽然默认就是），环图必须用它（DAG 不允许环）。
- `WithMaxRunSteps(MaxStep)`：第 04 篇的步数上限在这派上用场——Agent 循环必须有个终止保险，超过 `MaxStep` 返回 `ErrExceedMaxSteps`。

`Agent.Generate` / `Agent.Stream` 只是转调这个 runnable：

{% highlight go %}
func (r *Agent) Generate(ctx context.Context, input []*schema.Message, opts ...agent.AgentOption) (*schema.Message, error) {
    // → runnable.Invoke(ctx, input)
}
func (r *Agent) Stream(ctx context.Context, input []*schema.Message, opts ...agent.AgentOption) (*schema.StreamReader[*schema.Message], error) {
    // → runnable.Transform(ctx, streamInput)
}
{% endhighlight %}

用户调 `agent.Generate`，跑的就是第 05 篇那个 submit/wait/calculate 主循环。

## ToolReturnDirectly：用一个 Lambda 节点短路

有些工具（比如「查天气」直接念结果）不需要再过一遍模型，工具结果应当作最终答案直接返回。`buildReturnDirectly` 给图加了一个 Lambda 节点和第二个分支：

{% highlight go %}
nodeKeyDirectReturn := "direct_return"

// 一个 Transformable Lambda：从工具输出里挑出目标 tool_call 的那条消息
directReturn := func(ctx context.Context, msgs *schema.StreamReader[[]*schema.Message]) (*schema.StreamReader[*schema.Message], error) {
    return schema.StreamReaderWithConvert(msgs, func(msgs []*schema.Message) (*schema.Message, error) {
        var msg *schema.Message
        compose.ProcessState[*state](ctx, func(_ context.Context, state *state) error {
            for i := range msgs {
                if msgs[i] != nil && msgs[i].ToolCallID == state.ReturnDirectlyToolCallID {
                    msg = msgs[i]
                    return nil
                }
            }
            return nil
        })
        if msg == nil { return nil, schema.ErrNoValue }
        return msg, nil
    }), nil
}
graph.AddLambdaNode(nodeKeyDirectReturn, compose.TransformableLambda(directReturn))

// tools 之后的分支：标记了直接返回 → direct_return；否则 → 回 chat 继续循环
graph.AddBranch(nodeKeyTools, compose.NewStreamGraphBranch(
    func(ctx context.Context, msgsStream *schema.StreamReader[[]*schema.Message]) (string, error) {
        msgsStream.Close()
        endNode := nodeKeyModel
        compose.ProcessState[*state](ctx, func(_ context.Context, state *state) error {
            if len(state.ReturnDirectlyToolCallID) > 0 {
                endNode = nodeKeyDirectReturn
            }
            return nil
        })
        return endNode, nil
    }, map[string]bool{nodeKeyModel: true, nodeKeyDirectReturn: true}))

graph.AddEdge(nodeKeyDirectReturn, compose.END)  // 直接返回节点连到 END
{% endhighlight %}

于是工具节点之后有两条路：

- 默认回 `chat`，模型看到工具结果继续推理（这就是环的回程边）；
- 若这次工具被标记为「直接返回」，走 `direct_return` Lambda，它从 state 里取出对应 tool_call 的结果消息，送到 END。

这里能看到第 08 篇的 Lambda 直接派上用场——`direct_return` 是个一次性胶水逻辑，用 `TransformableLambda` 内联成节点最自然。`compose.ProcessState[*state]` 是在节点函数里读取图本地状态的方式。

## 完整的一轮 ReAct

串起来，`Generate([userMsg])`：

1. 主循环启动，state 初始化，`START → chat`。
2. chat 的 preHandler 把 `[userMsg]` 累积进 `state.Messages`，调模型。
3. 模型返回带 `tool_calls` 的 assistant 消息；chat 后分支 `toolCallChecker` 判定要调工具 → 路由到 `tools`。
4. tools 的 preHandler 把 assistant 消息存进历史、记录是否直接返回；ToolsNode 执行工具，产出 tool 结果消息。
5. tools 后分支：非直接返回 → 回 `chat`（环）。chat 的 preHandler 把工具结果累积进历史，再调模型。
6. 模型这次没有 tool_calls，给出最终回答；chat 后分支 → `END`，返回最终 `*schema.Message`。
7. 若模型一直调工具不收敛，`step` 撞 `MaxStep`，返回 `ErrExceedMaxSteps`。

整个过程没有任何「Agent 专用」的调度代码——分支条件负责决策，环负责循环，state 负责记忆，maxRunSteps 负责兜底，Lambda 负责短路。**Agent 是图编排能力的自然涌现，而不是框架里的一个特例。**

## 设计取舍

- **Agent = 带环 Graph**：不为 Agent 写专用运行时，最大化复用编排引擎；用户也能用同样的原语搭出 ReAct 之外的自定义 Agent 形态（多工具编排、条件子图等）。
- **状态用图本地 state 而非全局变量**：消息历史通过 context 传递、每次运行独立，并发/重入安全；preHandler 是读写 state 的统一切入点。
- **路由用流式分支 + 首 chunk 判断**：`NewStreamGraphBranch` + `firstChunkStreamToolCallChecker` 让流式下不用等模型说完就能决定是否调工具，降低 Agent 响应延迟。
- **MaxStep 作为环的硬性保险**：把「模型可能无限调工具」这个运行时风险，用编译期就设好的步数上限兜住。
- **ToolReturnDirectly 用 Lambda + 分支实现**：短路逻辑不进核心引擎，作为图上的两个普通元素存在，可加可减。

## 自己动手

- [ ] 用一个 mock 模型（前两次返回 tool_calls、第三次返回最终答案）和一个 mock 工具跑 `NewAgent`，在分支条件里打印路由，观察 `chat → tools → chat → tools → chat → END` 的环序列。
- [ ] 让 mock 模型**永远**返回 tool_calls，把 `MaxStep` 设成 3，观察 `ErrExceedMaxSteps`。
- [ ] 配置 `ToolReturnDirectly` 命中某个工具，观察该轮走 `direct_return → END` 而不是回 chat。
- [ ] 用 `MessageModifier` 每次给模型注入一条 system 消息，打印 `state.Messages`，确认 modifier 作用在副本上、原始历史没被污染。
- [ ] 不看本文，自己用 `NewGraph` + `AddChatModelNode` + `AddToolsNode` + 两个 `AddBranch` 手写一个最小 ReAct，体会它确实「只是一张图」。

---

*上一篇：[08 · Lambda：把普通函数变成图节点]({{ site.baseurl }}{% post_url 2026-09-04-eino-08-lambda %}) · 下一篇：10 · 设计取舍复盘：eino 教会我们的事。*
