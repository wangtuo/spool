---
title: "eino 04 · Compile：把一张图编译成可执行对象"
series: eino 源码分析
description: 建图期只登记拓扑，Compile 才把 nodes/edges/branches 翻译成运行时的 chanCall 表、前驱映射和 runner。本篇读 graph.compile：选运行模式、为每个节点生成 chanCall、反转出前驱表、DAG 校验环、maxRunSteps 兜底，最后 toComposableRunnable。
tags: [eino, llm, go, compose, compile, graph, pregel]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

第 03 篇结束时，我们手里是一张 `graph`：几组 map 记录了节点、控制边、数据边、分支。但它还**不能跑**——节点存的是用户的组件（`model.ChatModel`、`Lambda`……），边存的是字符串 key，类型推断还留了 `toValidateMap` 里的待办。

`Compile(ctx)` 要做的，是把这张「声明式拓扑」翻译成一个「可执行对象」：

- 每个节点该怎么被调用（它的 `Invoke`/`Stream`/… 四个方法里实际用哪个）；
- 一个节点跑完，输出该写给谁；要等哪些前驱都到齐才能触发；
- 整张图用 Pregel（允许环）还是 DAG（严格无环）语义；
- 环图要有步数上限，否则 Agent 死循环谁也拦不住。

产物是一个 `*composableRunnable`——和单个组件实现同样的 `Invoke/Stream/Collect/Transform` 四方法。**编译后，图和一个普通组件在类型上没有区别**，这正是图可以嵌套成子图的基础。

入口在 `compose/graph.go` 的 `func (g *graph) compile(...)`。

## 第一步：选运行模式与 channel 构造器

{% highlight go %}
runType := runTypePregel
cb := pregelChannelBuilder
if isChain(g.cmp) || isWorkflow(g.cmp) {
    if opt != nil && opt.nodeTriggerMode != "" {
        return nil, errors.New(...("doesn't support node trigger mode option"))
    }
}
if (opt != nil && opt.nodeTriggerMode == AllPredecessor) || isWorkflow(g.cmp) {
    runType = runTypeDAG
    cb = dagChannelBuilder
}

eager := false
if isWorkflow(g.cmp) || runType == runTypeDAG {
    eager = true
}
{% endhighlight %}

默认 **Pregel + pregelChannelBuilder**。只有显式 `WithNodeTriggerMode(AllPredecessor)` 或 Workflow 才切到 DAG。这里有两个绑定在一起的选择：

- **channel 构造器**决定了「一个节点的多个前驱产出如何汇聚」。Pregel channel 是「来一个值就能触发（AnyPredecessor）」，DAG channel 是「等所有前驱到齐才触发（AllPredecessor）」。第 06 篇细看。
- **eager**：DAG/Workflow 下为 true，影响任务调度器是「来一个完成的就推进」还是「等本批全部完成再推进」（第 05 篇 `taskManager.needAll`）。

Chain 不允许设 `nodeTriggerMode`——它本质是线性 Pregel，没有汇聚语义可配。

## 第二步：建图期遗留检查

{% highlight go %}
if len(g.startNodes) == 0 { return nil, errors.New("start node not set") }
if len(g.endNodes) == 0   { return nil, errors.New("end node not set") }

// toValidateMap isn't empty means there are nodes that cannot infer type
for _, v := range g.toValidateMap {
    if len(v) > 0 {
        return nil, fmt.Errorf("some node's input or output types cannot be inferred: %v", g.toValidateMap)
    }
}
{% endhighlight %}

第 03 篇讲的增量类型推断，到这里必须收敛。`toValidateMap` 里还挂着推断不出类型的端口，就直接编译失败——这是「能在编译期报的错绝不带到运行时」的兑现点。

字段映射（`fieldMappingRecords`）也在这里做重复目标检查，并把映射转换成一个**预处理 handler** 挂到节点上：

{% highlight go %}
for key := range g.fieldMappingRecords {
    toMap := make(map[string]bool)
    for _, mapping := range g.fieldMappingRecords[key] {
        if _, ok := toMap[mapping.to]; ok {
            return nil, fmt.Errorf("duplicate mapping target field: %s of node[%s]", mapping.to, key)
        }
        toMap[mapping.to] = true
    }
    g.handlerPreNode[key] = append(g.handlerPreNode[key],
        g.getNodeGenericHelper(key).inputFieldMappingConverter)
}
{% endhighlight %}

注意字段映射不是在边上改数据，而是落成一个 **preNode handler**——在数据进入目标节点前做结构体字段拼装。这样「数据汇聚」和「字段拼装」两个职责在运行时是分开的两层。

## 第三步：每个节点编译成一个 chanCall

这是编译的核心。遍历 `g.nodes`，把每个节点编译成 `*chanCall`：

{% highlight go %}
chanSubscribeTo := make(map[string]*chanCall)
for name, node := range g.nodes {
    node.beforeChildGraphCompile(name, key2SubGraphs)

    r, err := node.compileIfNeeded(ctx)   // 递归编译子图；普通节点则包装成 composableRunnable
    if err != nil { return nil, err }

    chCall := &chanCall{
        action:   r,                       // 可执行体（composableRunnable）
        writeTo:  g.dataEdges[name],       // 数据边：输出流到哪些节点
        controls: g.controlEdges[name],    // 控制边：只触发、不传数据

        preProcessor:  node.nodeInfo.preProcessor,
        postProcessor: node.nodeInfo.postProcessor,
    }

    branches := g.branches[name]
    if len(branches) > 0 {
        chCall.writeToBranches = append([]*GraphBranch{}, branches...)
    }
    chanSubscribeTo[name] = chCall
}
{% endhighlight %}

`chanCall` 就是运行时的「节点接线表」：

- `action`：节点怎么跑。普通组件经 `newRunnablePacker` 包成 `composableRunnable`（第 02/08 篇）；子图在这里**递归编译**成另一个 `composableRunnable`，所以图里套图对运行时只是一个节点。
- `writeTo`：数据边目标，输出会复制一份流过去。
- `controls`：控制边目标，只负责「唤醒」，不传数据。
- `writeToBranches`：挂在节点后的分支条件，运行时求值决定下一跳。
- `preProcessor/postProcessor`：`WithStatePreHandler` 之类挂的状态处理函数（ReAct 里大量用到，第 09 篇）。

## 第四步：反转邻接表，得到前驱映射

建图期存的是 `start → []end`（出边）。运行时调度关心的是反方向：**「我这个节点要等谁？」** 于是编译期把边反转成 `controlPredecessors` / `dataPredecessors`：

{% highlight go %}
dataPredecessors := make(map[string][]string)
controlPredecessors := make(map[string][]string)
for start, ends := range g.controlEdges {
    for _, end := range ends {
        controlPredecessors[end] = append(controlPredecessors[end], start)
    }
}
for start, ends := range g.dataEdges {
    for _, end := range ends {
        dataPredecessors[end] = append(dataPredecessors[end], start)
    }
}
// 分支的 endNodes 白名单也算前驱；noDataFlow 的分支只算控制前驱
for start, branches := range g.branches {
    for _, branch := range branches {
        for end := range branch.endNodes {
            controlPredecessors[end] = append(controlPredecessors[end], start)
            if !branch.noDataFlow {
                dataPredecessors[end] = append(dataPredecessors[end], start)
            }
        }
    }
}
{% endhighlight %}

为什么要分两份前驱？因为**触发条件**和**数据来源**是两回事：

- 控制前驱决定「channel 里的依赖计数」——一个分支节点即使这次没被选中，也可能需要知道某前驱已经跑完（用于跳过判断）。
- 数据前驱决定「channel 里的值从哪来、要不要等它到齐才能 fan-in 合并」。

`channelManager.updateValues` 里会用 `dataPredecessors` 过滤：不是数据前驱送来的值会被**直接 close 掉**，避免脏数据进 channel。

## 第五步：组装 runner

输入节点 `START` 也被表达成一个特殊的 `chanCall`（`inputChannels`），它把外部输入写向 `START` 的出边。然后所有东西塞进 `runner`：

{% highlight go %}
r := &runner{
    chanSubscribeTo:     chanSubscribeTo,
    controlPredecessors: controlPredecessors,
    dataPredecessors:    dataPredecessors,
    inputChannels:       inputChannels,
    eager:               eager,
    chanBuilder:         cb,                 // pregelChannelBuilder / dagChannelBuilder

    inputType:     g.inputType(),
    outputType:    g.outputType(),
    genericHelper: g.genericHelper,

    preBranchHandlerManager: &preBranchHandlerManager{h: g.handlerPreBranch},
    preNodeHandlerManager:   &preNodeHandlerManager{h: g.handlerPreNode},
    edgeHandlerManager:      &edgeHandlerManager{h: g.handlerOnEdges},
    mergeConfigs:            mergeConfigs,
}
{% endhighlight %}

三类 handler manager 对应三个可插入切面的位置：**边上映射**（edge）、**节点前**（preNode，含字段映射和 state preHandler）、**分支前**（preBranch）。运行时在对应位置调用它们。

如果图带本地状态（`WithGenLocalState`），还会装一个 `runCtx`，在每次运行时从 state generator 造一份新状态塞进 context：

{% highlight go %}
if g.stateGenerator != nil {
    r.runCtx = func(ctx context.Context) context.Context {
        var parent *internalState
        if p, ok := ctx.Value(stateKey{}).(*internalState); ok { parent = p }
        return context.WithValue(ctx, stateKey{}, &internalState{
            state:  g.stateGenerator(ctx),
            parent: parent,   // 子图能访问父图状态
        })
    }
}
{% endhighlight %}

## 第六步：DAG 校验与步数兜底

{% highlight go %}
if runType == runTypeDAG {
    if err := validateDAG(r.chanSubscribeTo, controlPredecessors); err != nil {
        return nil, err
    }
    r.dag = true
}

// default options
if r.dag && r.options.maxRunSteps > 0 {
    return nil, fmt.Errorf("cannot set max run steps in dag mode")
} else if !r.dag && r.options.maxRunSteps == 0 {
    r.options.maxRunSteps = len(r.chanSubscribeTo) + 10
}
{% endhighlight %}

两个关键约束：

1. **DAG 模式不许有环**。`validateDAG` 沿控制边做环检测，有环直接返回 `DAGInvalidLoopErr`。因为 DAG 语义是「所有前驱到齐才触发」，环里的节点永远等不齐，是死锁，不如编译期就拒绝。
2. **Pregel 模式必须有步数上限**。因为它允许环（Agent 循环），就有死循环风险。默认 `节点数 + 10`：一个无环图最多每个节点跑一次，`+10` 给循环留出余量。运行时主循环每轮 `step++`，超过就返回 `ErrExceedMaxSteps`。DAG 模式反而禁止设 maxRunSteps——它无环，步数天然有界，设了说明用户误解了语义。

最后 `g.compiled = true`，返回：

{% highlight go %}
return r.toComposableRunnable(), nil
{% endhighlight %}

## toComposableRunnable：图伪装成一个组件

`runner` 本身是内部调度器，对外要暴露成 `Runnable[I,O]`。`toComposableRunnable` 把它的 `invoke`/`transform` 包成 `composableRunnable` 的两个内部字段 `i`/`t`：

{% highlight go %}
func (r *runner) toComposableRunnable() *composableRunnable {
    cr := &composableRunnable{
        i: func(ctx context.Context, input any, opts ...any) (any, error) {
            tos, _ := convertOption[Option](opts...)
            return r.invoke(ctx, input, tos...)
        },
        t: func(ctx context.Context, input streamReader, opts ...any) (streamReader, error) {
            tos, _ := convertOption[Option](opts...)
            return r.transform(ctx, input, tos...)
        },
        inputType:     r.inputType,
        outputType:    r.outputType,
        genericHelper: r.genericHelper,
        optionType:    nil, // if option type is nil, graph will transmit all options.
    }
    return cr
}
{% endhighlight %}

注意 `optionType` 为 nil——图不声明自己的 option 类型，于是**所有透传 option 都会下发给每个节点**，各节点各取所需。这是图作为「组合体」而非「具体组件」的一个小设计。

而 `invoke`/`transform` 都只是转调同一个 `run`，只差一个布尔位：

{% highlight go %}
func (r *runner) invoke(ctx context.Context, input any, opts ...Option) (any, error) {
    return r.run(ctx, false, input, opts...)
}
func (r *runner) transform(ctx context.Context, input streamReader, opts ...Option) (streamReader, error) {
    s, err := r.run(ctx, true, input, opts...)
    if err != nil { return nil, err }
    return s.(streamReader), nil
}
{% endhighlight %}

**非流式和流式是同一套调度循环**，`isStream` 只影响「值怎么传、分支怎么求值、stream 要不要 copy」。这是 eino 四模式统一的又一体现。

## 设计取舍

- **重编译期、轻运行时**：eino 把能提前算的都在 `compile` 算好——出边反转成前驱、字段映射固化成 handler、子图递归编译、类型推断收敛、环检测。运行时主循环因此非常简单（下一篇看）：查表、提交任务、等完成、再查表。代价是编译逻辑复杂、`graph` 结构体字段多，但运行时 hot path 几乎没有反射和拓扑计算。
- **Pregel/DAG 二选一，且在编译期定死**：不做运行时动态切换，换来了 channel 实现可以各自最简。Pregel 为环付出 `maxRunSteps` 兜底，DAG 为全前置汇聚付出「禁止环」的约束，语义边界清晰。
- **控制前驱与数据前驱分开存**：多一份 map，换来分支跳过、纯控制依赖、fan-in 数据过滤三者能干净组合。
- **编译产物就是一个组件**：`runner` 包成 `composableRunnable` 后，图和 Lambda、ChatModel 在类型上同构。嵌套、复用、当节点传递都零成本——这是「一切皆 Runnable」架构的收口。

## 自己动手

- [ ] 给一个带环的图（`A→B→A`）用 `WithNodeTriggerMode(AllPredecessor)` 编译，观察 DAG 环检测报错；去掉该选项再编译，对比。
- [ ] 打印 `len(nodes)+10`，然后构造一个循环次数超过它的 Agent（第 09 篇的 ReAct），观察 `ErrExceedMaxSteps`。
- [ ] 在 DAG 模式下传 `WithMaxRunSteps(100)`，观察 `cannot set max run steps in dag mode`。
- [ ] 把子图作为一个节点 `AddGraphNode` 加入父图，在 `compileIfNeeded` 处打断点，确认子图是在父图 `compile` 时被递归编译的。

---

*上一篇：[03 · compose 基础：Chain 与 Graph 的拓扑构建]({{ site.baseurl }}{% post_url 2026-09-04-eino-03-chain-graph %}) · 下一篇：05 · 运行时（上）—— Invoke 调用链与任务调度循环。*
