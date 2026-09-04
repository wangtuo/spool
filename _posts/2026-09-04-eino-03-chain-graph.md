---
title: "eino 03 · compose 基础：Chain 与 Graph 的拓扑构建"
series: eino 源码分析
description: 编排层把节点和边登记成一张内部拓扑表。本篇读 Graph 的 nodes/controlEdges/dataEdges/branches 结构、AddEdge 如何区分控制边与数据边、增量类型推断，以及 Chain 为什么只是 Graph 的线性封装。
tags: [eino, llm, go, compose, graph, dag]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

有了组件（第 02 篇）和数据模型（第 01 篇），还要回答：怎么把一堆组件连成一个有意义的流程？流程可能是直线（prompt → model → parser），可能有分支（要不要调工具），可能有并发（两个模型同时跑），甚至可能有环（Agent 循环）。

eino 用一张**图**来描述。这一篇只看「建图期」：`NewGraph` / `NewChain` 之后，一连串 `AddXxxNode` / `AddEdge` / `AddBranch` 到底在内部数据结构里登记了什么。编译和运行留给 04–06 篇。

## 两个特殊节点与两种运行模式

图里有两个保留节点名（`compose/graph.go`）：

{% highlight go %}
const START = "start"
const END   = "end"
{% endhighlight %}

图还有两种运行模式：

{% highlight go %}
const (
    runTypePregel graphRunType = "Pregel" // 允许有环，配合 AnyPredecessor 触发
    runTypeDAG    graphRunType = "DAG"    // 有向无环，配合 AllPredecessor 触发
)
{% endhighlight %}

**Pregel 模式允许环**——这是 Agent「model → tools → model」循环能跑的前提；DAG 模式严格无环、可做全前置汇聚。默认是 Pregel，Workflow 或显式 `AllPredecessor` 时用 DAG。

## 核心结构：一张图就是几张 map

`graph` 结构体把拓扑拆成几组集合：

{% highlight go %}
type graph struct {
    nodes        map[string]*graphNode   // 节点 key -> 节点
    controlEdges map[string][]string     // 控制边：A -> [B,C]，表示调度依赖
    dataEdges    map[string][]string     // 数据边：A -> [B,C]，表示数据流向
    branches     map[string][]*GraphBranch // 某节点上挂的条件分支

    startNodes []string // 从 START 出发能直达的节点
    endNodes   []string // 能直达 END 的节点

    toValidateMap map[string][]struct { // 待类型校验的边
        endNode  string
        mappings []*FieldMapping
    }
    fieldMappingRecords map[string][]*FieldMapping
    handlerOnEdges      map[string]map[string][]handlerPair // 边上的数据转换
    // ... stateType、expectedInputType/OutputType、compiled 等
}
{% endhighlight %}

最关键的设计是**控制边与数据边分离**：

- **控制边（controlEdges）**回答「什么时候可以触发 B」——B 的依赖是否都完成了。
- **数据边（dataEdges）**回答「B 的输入从谁那里来」——值沿着哪些边流动。

大多数边两者都是，但可以只用其一（`addEdgeWithMappings` 的 `noControl` / `noData` 参数）。比如分支选中的目标要有控制依赖，而分支没选中的路径不该传数据。这个区分在第 05 篇看运行时会变得非常重要。

## AddEdge：登记拓扑 + 增量类型校验

`AddEdge` 最终走到 `addEdgeWithMappings`，做三件事：

1. **校验**：`END` 不能当起点、`START` 不能当终点、起止节点必须已存在、边不能重复。
2. **登记控制边**：`controlEdges[start] = append(..., end)`；若起点是 `START` 记入 `startNodes`，终点是 `END` 记入 `endNodes`。
3. **登记数据边 + 排队做类型校验**：`dataEdges[start] = append(...)`，并把这条边塞进 `toValidateMap`，然后调 `updateToValidateMap()` 尝试推断。

{% highlight go %}
func (g *graph) addEdgeWithMappings(startNode, endNode string, noControl, noData bool, mappings ...*FieldMapping) error {
    // ...校验...
    if !noControl {
        g.controlEdges[startNode] = append(g.controlEdges[startNode], endNode)
        if startNode == START { g.startNodes = append(g.startNodes, endNode) }
        if endNode == END     { g.endNodes   = append(g.endNodes, startNode) }
    }
    if !noData {
        g.addToValidateMap(startNode, endNode, mappings)
        err = g.updateToValidateMap() // 增量类型推断
        g.dataEdges[startNode] = append(g.dataEdges[startNode], endNode)
    }
    return nil
}
{% endhighlight %}

为什么类型校验是**增量、反复**跑的（`updateToValidateMap` 里是个 `for { hasChanged ... }` 循环）？因为建图时节点的输入/输出类型可能暂时未知——尤其是 **Passthrough 透传节点**，它的类型要等邻居确定后才能反推。源码里会把已知一侧的类型「赋」给透传节点（`forSuccessorPassthrough` / `forPredecessorPassthrough`），一轮推断可能解锁下一轮，直到稳定。

对一条普通边，类型校验用 `checkAssignable(上游输出类型, 下游输入类型)`，结果三态：

- `mustNot`：类型不兼容 → 直接报错；
- `may`：可能兼容（比如 `any`）→ 不报错，但在 `handlerOnEdges` 上挂一个**运行时类型转换器**；
- 完全匹配 → 无需处理。

字段映射（`FieldMapping`，对应 `WithInputKey/WithOutputKey`）也在这里校验：把上游结构体的某些字段映射到下游结构体字段，校验路径存在、且不允许两个源映射到同一目标字段。

## AddXxxNode：组件先被包成 graphNode

`AddChatModelNode` / `AddRetrieverNode` / `AddLambdaNode` …… 模式完全一致：

{% highlight go %}
func (g *graph) AddChatModelNode(key string, node model.BaseChatModel, opts ...GraphAddNodeOpt) error {
    gNode, options := toChatModelNode(node, opts...) // 组件 -> *graphNode
    return g.addNode(key, gNode, options)
}
{% endhighlight %}

`toXxxNode` 负责把第 02 篇讲的组件接口适配成内部统一的 `graphNode`（里面最终是一个 `composableRunnable`，下一篇细讲）。`addNode` 做登记前校验：key 不能是 `START/END`、不能重复、若节点声明需要 state 则图必须启用了 state、state pre/post handler 的类型要和节点 I/O 对齐。

## Branch：条件路由

分支用 `GraphBranch` 表达（`compose/branch.go`）。核心是一个条件函数，返回**目标节点 key**：

{% highlight go %}
type GraphBranchCondition[T any] func(ctx context.Context, in T) (endNode string, err error)

func NewGraphBranch[T any](condition GraphBranchCondition[T], endNodes map[string]bool) *GraphBranch
{% endhighlight %}

`endNodes` 是这份分支**允许跳转的目标白名单**。条件返回的节点若不在白名单里，直接报错（`branch invocation returns unintended end node`）——这把「路由到一个不存在/未授权的节点」这种错误提前拦在装配期。

分支也有流式版本，条件函数拿到的是输入流，可以用第一个 chunk 做判断：

{% highlight go %}
type StreamGraphBranchCondition[T any] func(ctx context.Context, in *schema.StreamReader[T]) (endNode string, err error)
func NewStreamGraphBranch[T any](condition StreamGraphBranchCondition[T], endNodes map[string]bool) *GraphBranch
{% endhighlight %}

还有多选版本 `NewGraphMultiBranch`，条件返回 `map[string]bool`，一次可路由到多个下游（扇出）。

`AddBranch(startNode, branch)` 会：校验条件入参类型与 startNode 输出类型匹配；把每个 endNode 登记成 startNode 的后继（控制边 + 数据边，除非 `noDataFlow`）；分支对象存进 `g.branches[startNode]`。

## Chain：只是 Graph 的线性语法糖

`NewChain` 内部直接 `NewGraph`，并打上 `ComponentOfChain` 标记：

{% highlight go %}
func NewChain[I, O any](opts ...NewGraphOption) *Chain[I, O] {
    ch := &Chain[I, O]{gg: NewGraph[I, O](opts...)}
    ch.gg.cmp = ComponentOfChain
    return ch
}
{% endhighlight %}

Chain 用 `preNodeKeys` 记住「当前链条的末端是哪些节点」。每次 `AppendXxx`：

{% highlight go %}
func (c *Chain[I, O]) addNode(node *graphNode, options *graphAddNodeOpts) {
    // ...
    if len(c.preNodeKeys) == 0 {
        c.preNodeKeys = append(c.preNodeKeys, START)
    }
    for _, preNodeKey := range c.preNodeKeys {
        c.gg.AddEdge(preNodeKey, nodeKey)   // 自动把上一节点连到新节点
    }
    c.preNodeKeys = []string{nodeKey}       // 链条末端前移
}
{% endhighlight %}

所以链式写法 `AppendChatTemplate(...).AppendChatModel(...)` 本质就是自动帮你 `AddEdge(prev, next)`。`AppendParallel` 会把多个节点同时连到当前末端、再把末端设成这一组；`AppendBranch` 则把分支的各个目标节点设为新的末端。编译时 `addEndIfNeeded()` 把所有末端连到 `END`。Chain 不支持 `nodeTriggerMode`（它本质是线性 Pregel）。

## 设计取舍

- **控制边/数据边分离**：多花一组 map，换来「调度依赖」和「数据流向」可以独立表达，分支、跳过节点、纯控制依赖才干净。这是比「一张邻接表走天下」更费结构但更能表达 Agent 语义的选择。
- **建图期尽可能推断类型，推断不了挂运行时转换**：`checkAssignable` 的三态 + `toValidateMap` 多轮收敛，把能在编译期报的错（类型不兼容、重复映射、路由到非法节点）提前；`any` 这类静态无法确定的才推迟到运行时。
- **Chain 不另起炉灶**：它只是 Graph 上加了一层自动连边的 builder，复用同一套编译/运行时。学习成本低，能力上限却和 Graph 一致。
- **Pregel 默认允许环**：为 Agent 循环让路，代价是需要 `maxRunSteps` 兜底防死循环（第 09 篇会看到默认 `节点数+10`）。

## 自己动手

- [ ] 建一个 `NewGraph[string, string]`，`AddLambdaNode("a", ...)`、`AddLambdaNode("b", ...)`，只 `AddEdge(START,"a")` 但不连 `b` 也不连 `END`，调用 `Compile`，观察报错（`end node not set` / 有节点不可达）。
- [ ] 故意把输出 `*schema.Message` 的节点连到输入 `string` 的节点，观察编译期的 `mismatch` 报错信息。
- [ ] 用 `NewGraphBranch` 写一个返回白名单外节点 key 的条件，运行/编译时观察 `unintended end node` 错误。
- [ ] 把同一条 Chain 用 `NewGraph` 手写一遍等价的边，体会 Chain 省掉了哪些 `AddEdge`。

---

*上一篇：[02 · components：组件接口的抽象哲学]({% post_url 2026-09-03-eino-02-components %}) · 下一篇：04 · 编译期 —— Compile 如何把图变成可执行对象。*
