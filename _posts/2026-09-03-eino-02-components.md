---
title: "eino 02 · components：组件接口的抽象哲学"
series: eino 源码分析
description: eino 不给基类、不靠继承，而是用一组极小接口 + 接口嵌入组合出 ChatModel / Tool / Retriever 等组件契约。本篇读透这些接口怎么定义、能力如何被编排层探测，以及 BindTools 与 WithTools 背后的可变/不可变取舍。
tags: [eino, llm, go, 接口设计, 组件]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

上一篇看到，数据在框架里统一是 `schema.Message` / `StreamReader[T]`。但**生产数据的「组件」**千差万别：ChatModel 有几十家、检索器有向量库/关键词/混合、工具可能是本地函数也可能是 MCP 服务。

框架要回答两个问题：

1. 怎么用一套类型，把「模型、工具、检索器、嵌入器」都抽象出来，让 compose 编排层能无差别调度？
2. Go 没有基类、没有继承、没有重载，靠什么表达「一个组件可能支持流式、也可能不支持；可能能绑工具、也可能不能」？

eino 的答案是 **接口隔离（Interface Segregation）+ 接口嵌入组合**：每个能力是一个极小接口，组件按需实现，编排层用**类型断言（type assertion）在编译/运行时探测能力**。这一篇读 `components/` 下几个最典型的定义。

## ChatModel：泛型基接口 + 能力分层

`components/model/interface.go` 先用一个泛型接口表达「能生成、能流式」这件最基础的事：

{% highlight go %}
type messageType interface {
    *schema.Message | *schema.AgenticMessage
}

type BaseModel[M messageType] interface {
    Generate(ctx context.Context, input []M, opts ...Option) (M, error)
    Stream(ctx context.Context, input []M, opts ...Option) (*schema.StreamReader[M], error)
}
{% endhighlight %}

两个方法正好对应上一篇的两种数据到达方式：`Generate` 返回完整值，`Stream` 返回 `StreamReader[M]`。泛型参数 `M` 用类型约束（type constraint）封死成两种消息——普通对话用 `*schema.Message`，Agentic 场景用 `*schema.AgenticMessage`。日常用的 `ChatModel` 其实是个别名：

{% highlight go %}
type BaseChatModel = BaseModel[*schema.Message]
type AgenticModel  = BaseModel[*schema.AgenticMessage]
{% endhighlight %}

> 用类型别名（`=`）而不是新类型，是为了**向后兼容**：老代码里的 `model.BaseChatModel` 一字不改继续工作。

### 能力扩展：绑工具的两种接口

模型要不要支持「工具调用」？eino 没有把 `BindTools` 塞进基接口强迫所有实现都写，而是拆成两个独立接口：

{% highlight go %}
// 已废弃：原地修改，并发不安全
type ChatModel interface {
    BaseChatModel
    BindTools(tools []*schema.ToolInfo) error
}

// 推荐：返回新实例，不可变、并发安全
type ToolCallingChatModel interface {
    BaseChatModel
    WithTools(tools []*schema.ToolInfo) (ToolCallingChatModel, error)
}
{% endhighlight %}

这是整篇最值得停下来看的设计。源码注释把取舍写得很直白：

- `BindTools` **原地修改**接收者（mutate in place）。同一个模型实例被多个 goroutine 并发用时，A 请求绑的工具会被 B 请求覆盖——典型的 data race。
- `WithTools` **返回一个带工具的新实例**，基础实例可以安全共享，再按请求派生出不同工具集的变体：

{% highlight go %}
base, _ := openai.NewChatModel(ctx, cfg)        // 共享、无工具
withSearch, _ := base.WithTools([]*schema.ToolInfo{searchTool})
withCalc, _  := base.WithTools([]*schema.ToolInfo{calcTool})
{% endhighlight %}

一个接口被废弃、另一个被推荐，区别**不在功能而在可变性语义**。这是「把并发安全编码进 API 形状」的好例子：不可变的派生天然可共享，可变的共享就埋雷。

> 编排层怎么知道一个模型支不支持工具？在需要工具的节点里做 `m.(model.ToolCallingChatModel)` 类型断言，断言失败就报「该模型不支持工具调用」。能力是**探测**出来的，不是基类强制的。

## Tool：元数据与执行分离

`components/tool/interface.go` 把「工具」拆成三层，最小的接口只负责「自我介绍」：

{% highlight go %}
// 只要元数据：把工具定义喂给模型，让它决定要不要调
type BaseTool interface {
    Info(ctx context.Context) (*schema.ToolInfo, error)
}

// 能被 ToolsNode 执行（非流式）
type InvokableTool interface {
    BaseTool
    InvokableRun(ctx context.Context, argumentsInJSON string, opts ...Option) (string, error)
}

// 能被 ToolsNode 执行（流式）
type StreamableTool interface {
    BaseTool
    StreamableRun(ctx context.Context, argumentsInJSON string, opts ...Option) (*schema.StreamReader[string], error)
}
{% endhighlight %}

注意这个分层的巧思：

- **只把工具定义给模型看**（让它生成 tool_call）时，`BaseTool` 就够了——模型只需要名字、描述、参数 schema，不需要真的能执行。
- **要真正执行**时，才需要 `InvokableRun` / `StreamableRun`。入参是模型给的 **JSON 字符串**（`argumentsInJSON`），出参是字符串或字符串流——框架在 `utils.InferTool` / `NewTool` 里帮你做 JSON 编解码。

还有一对 `Enhanced*` 接口，返回的不是字符串而是结构化多模态结果 `*schema.ToolResult`（可带图/音/视频/文件）：

{% highlight go %}
type EnhancedInvokableTool interface {
    BaseTool
    InvokableRun(ctx context.Context, toolArgument *schema.ToolArgument, opts ...Option) (*schema.ToolResult, error)
}
type EnhancedStreamableTool interface {
    BaseTool
    StreamableRun(ctx context.Context, toolArgument *schema.ToolArgument, opts ...Option) (*schema.StreamReader[*schema.ToolResult], error)
}
{% endhighlight %}

当一个工具同时实现了普通版和 Enhanced 版，**ToolsNode 优先用 Enhanced 版**。这又是一种「能力探测 + 优先级」约定：实现更强的接口，就自动被当成更强的组件用。

## ToolInfo 与 ParamsOneOf：参数 schema 的两种表达

工具的「自我介绍」内容是 `schema.ToolInfo`：

{% highlight go %}
type ToolInfo struct {
    Name  string         // 工具集内唯一、见名知意
    Desc  string         // 告诉模型何时/为何用，可放 few-shot 例子
    Extra map[string]any
    *ParamsOneOf        // 内嵌；nil 表示无参数
}
{% endhighlight %}

参数 schema 用 `ParamsOneOf` 表达，**二选一**（字段私有，强制走构造函数，杜绝两个都填）：

{% highlight go %}
type ParamsOneOf struct {
    params     map[string]*ParameterInfo // 轻量：标量/数组/嵌套对象/枚举/required
    jsonschema *jsonschema.Schema        // 完整 JSON Schema 2020-12，支持 anyOf/oneOf/$defs
}

func NewParamsOneOfByParams(params map[string]*ParameterInfo) *ParamsOneOf
func NewParamsOneOfByJSONSchema(s *jsonschema.Schema) *ParamsOneOf
func (p *ParamsOneOf) ToJSONSchema() (*jsonschema.Schema, error)
{% endhighlight %}

`ToJSONSchema()` 是归一化出口：轻量的 `ParameterInfo` 会被递归转成标准 JSON Schema（嵌套对象转 `properties`、`Required` 收集成 `required` 数组、数组转 `items`），直接给了 jsonschema 的原样返回。这样**各家模型适配层只认一种格式**，不用关心用户用哪种方式声明。

`ToolInfo` 还同时实现了 `MarshalJSON/UnmarshalJSON` 和 `GobEncode/GobDecode`——因为工具定义要在进程边界（RPC、缓存）传递，需要两种序列化方式且保证往返一致（连「空但非 nil 的 params map 被 omitempty 丢掉」这种边界都有注释处理）。

## Retriever：单方法接口的极简

对比之下检索器干净到只有一个方法（`components/retriever/interface.go`）：

{% highlight go %}
type Retriever interface {
    Retrieve(ctx context.Context, query string, opts ...Option) ([]*schema.Document, error)
}
{% endhighlight %}

入参一个自然语言 query 字符串，出参按相关性排序的 `[]*schema.Document`。要不要带 embedding 检索、TopK、分数阈值，全部走 `opts ...Option`（函数式选项模式），接口本身保持稳定。

## 贯穿全组件的模式

把这几个文件摆在一起，eino 的组件抽象哲学就清晰了：

1. **接口极小、按能力切**。`Generate/Stream` 是一对，`Invoke/Stream` 是一对，`Info` 独立成 `BaseTool`。需要什么能力就断言什么接口，而不是逼所有实现继承一个胖基类。
2. **接口嵌入做组合**。`ToolCallingChatModel` 嵌入 `BaseChatModel`，`InvokableTool` 嵌入 `BaseTool`——用 Go 的结构体式嵌入表达「is-a」，而不是继承树。
3. **流式/非流式成对出现**，且流式版本永远返回上一篇讲的 `*schema.StreamReader[T]`。组件作者实现哪几个方法，决定了它在 Graph 里能被怎么连。
4. **能力靠类型断言探测**。compose 层在编译/装配节点时检查组件实现了哪些接口（能否流式、能否绑工具、是否 Enhanced），据此决定怎么包装和调度。这是「Interface Slice」模式：一组可选接口，实现即声明能力。
5. **可变 vs 不可变写进 API**。`BindTools`（原地改、并发不安全）被废弃，`WithTools`（返回新实例、可共享）被推荐。

## 设计取舍

- **好处**：组件作者负担最小——不支持流式就不写 `Stream`，不支持工具就不用实现；框架扩展性强，新增能力 = 新增一个小接口 + 一处类型断言。
- **代价**：编排层不得不写大量类型断言/type switch 来探测能力，逻辑分散；接口太多时，「这个组件到底实现了哪些能力」不能一眼看全，得靠文档和断言测试。`go:generate mockgen ... BaseChatModel,ChatModel,ToolCallingChatModel` 这种把多个接口名显式列出来生成 mock，也侧面说明能力是分散在多个接口里的。
- **序列化成本**：`ToolInfo` 为跨进程传输同时维护 JSON 和 Gob 两套编解码，是「框架要当基础设施用」才会付的复杂度。

## 自己动手

- [ ] 写一个最小 `InvokableTool`：实现 `Info()`（用 `NewParamsOneOfByParams` 声明一个 `city string` 参数）和 `InvokableRun`（返回 `"hello " + city`）。用 `utils.InferTool` 从一个 Go 函数 + struct tag 生成同样的工具，打印两者 `Info().ToJSONSchema()`，对比输出。
- [ ] 对一个只实现了 `BaseChatModel`（不实现 `WithTools`）的 mock 模型做 `_, ok := m.(model.ToolCallingChatModel)`，观察 `ok == false`，体会「能力探测」。
- [ ] 用 `InferTool` 生成带嵌套 struct 参数的工具，跟踪 `ToJSONSchema()` 如何把嵌套字段转成 `properties` + `required`。

---

*上一篇：[01 · schema：消息与流式的统一数据模型]({{ site.baseurl }}{% post_url 2026-09-03-eino-01-schema-and-stream %}) · 下一篇：03 · compose 基础 —— Chain 与 Graph 的拓扑构建。*
