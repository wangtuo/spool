---
title: "eino 05 · 运行时（上）：Invoke 调用链与任务调度循环"
series: eino 源码分析
description: Compile 产出 runner 之后，一次 Invoke 怎么跑？本篇走 runner.run 主循环：channelManager 管就绪、taskManager 管并发，calculateNextTasks 三步（resolveCompletedTasks → updateAndGet → createTasks）驱动图一层层推进，直到 END 产出结果。
tags: [eino, llm, go, compose, runtime, scheduler, pregel]
source_version: "cloudwego/eino main 分支（分析于 2026-09，符号以 main 为准）"
---

## 要解决的问题

上一篇 Compile 结束，我们拿到一个 `*composableRunnable`，它的 `i`/`t` 指向 `runner.invoke`/`runner.transform`。这一篇跟着一次**非流式 `Invoke`** 走完整调用链，看一张图是怎么被「一层一层」推进的。

核心问题是：节点之间有依赖、有并发、有分支、（Pregel 下）还有环。运行时怎么知道「现在该跑哪些节点」？怎么等它们跑完？跑完又怎么决定下一批？

eino 的答案是两个管理器加一个循环：

- **channelManager**：每个节点一个 channel（邮箱）。上游把产出写进下游 channel；channel 根据前驱状态判断「我这个节点就绪了吗」。
- **taskManager**：把就绪节点包装成 task 并发执行，收集完成的 task。
- **主循环**：完成一批 → 把产出分发到下游 channel → 取出新就绪的节点 → 再提交。周而复始直到 `END`。

入口还是 `compose/graph_run.go` 的 `runner.run`。

## run 的骨架

`invoke` 就是 `run(ctx, false, input)`。`run` 开头做一堆初始化（option 抽取、checkpoint 恢复、状态初始化），核心是建好两个管理器：

{% highlight go %}
cm := r.initChannelManager(isStream)               // 每个节点一个 channel
tm := r.initTaskManager(runWrapper, getGraphCancel(ctx), opts...)
maxSteps := r.options.maxRunSteps
{% endhighlight %}

然后从一个**虚拟的 START 任务**启动：把外部 input 当作 START 节点的产出，算出第一批要跑的任务：

{% highlight go %}
nextTasks, result, isEnd, err = r.calculateNextTasks(ctx, []*task{{
    nodeKey: START,
    call:    r.inputChannels,   // START 的特殊 chanCall
    output:  input,
}}, isStream, cm, optMap)
{% endhighlight %}

之后就是主循环。去掉 checkpoint / interrupt 这些支线，骨架非常清楚：

{% highlight go %}
for step := 0; ; step++ {
    select {
    case <-ctx.Done():
        _, _ = tm.waitAll()
        return nil, newGraphRunError(fmt.Errorf("context has been canceled: %w", ctx.Err()))
    default:
    }
    if !r.dag && step >= maxSteps {
        return nil, newGraphRunError(ErrExceedMaxSteps)
    }

    // 1. 提交这一批任务（并发执行）
    err = tm.submit(nextTasks)

    // 2. 等这批任务跑完（needAll 时等全部，否则来一个返回一个）
    completedTasks, canceled, canceledTasks := tm.wait()
    if len(completedTasks) == 0 {
        return nil, newGraphRunError(fmt.Errorf("no tasks to execute, last completed nodes: %v", printTask(lastCompletedTask)))
    }
    lastCompletedTask = completedTasks

    // 3. 分发产出、取下一批就绪任务
    nextTasks, result, isEnd, err = r.calculateNextTasks(ctx, completedTasks, isStream, cm, optMap)
    if isEnd {
        return result, nil
    }
}
{% endhighlight %}

三步循环：**submit → wait → calculateNextTasks**。`calculateNextTasks` 返回 `isEnd=true` 时，`result` 就是 END 节点的产出，直接返回。步数 `step` 超过 `maxSteps` 就报 `ErrExceedMaxSteps`——上一篇说的环兜底就在这。

## calculateNextTasks：推进的核心

一批任务跑完后，怎么变成下一批？三步：

{% highlight go %}
func (r *runner) calculateNextTasks(ctx context.Context, completedTasks []*task,
    isStream bool, cm *channelManager, optMap map[string][]any) ([]*task, any, bool, error) {

    // (1) 把刚完成任务的产出，按「目标节点 → 来源节点 → 值」整理好；并求分支
    writeChannelValues, controls, err := r.resolveCompletedTasks(ctx, completedTasks, isStream, cm)
    if err != nil { return nil, nil, false, err }

    // (2) 写进各节点 channel，取出所有「就绪」节点的输入
    nodeMap, err := cm.updateAndGet(ctx, writeChannelValues, controls)
    if err != nil { return nil, nil, false, fmt.Errorf("failed to update and get channels: %w", err) }

    var nextTasks []*task
    if len(nodeMap) > 0 {
        // (3) END 就绪 → 整个图结束
        if v, ok := nodeMap[END]; ok {
            return nil, v, true, nil
        }
        // 否则把每个就绪节点包装成 task
        nextTasks, err = r.createTasks(ctx, nodeMap, optMap)
    }
    return nextTasks, nil, false, nil
}
{% endhighlight %}

### (1) resolveCompletedTasks：分发产出 + 求分支

{% highlight go %}
for _, t := range completedTasks {
    // 控制边：只登记依赖（唤醒），不传数据
    for _, key := range t.call.controls {
        newDependencies[key] = append(newDependencies[key], t.nodeKey)
    }

    // 把输出复制成若干份（数据边目标 + 分支目标）
    vs := copyItem(t.output, len(t.call.writeTo)+len(t.call.writeToBranches)*2)

    // 求分支：这个节点的分支条件这次选中了哪些下游？
    nextNodeKeys, err := r.calculateBranch(ctx, t.nodeKey, t.call,
        vs[len(t.call.writeTo)+len(t.call.writeToBranches):], isStream, cm)

    for _, key := range nextNodeKeys {
        newDependencies[key] = append(newDependencies[key], t.nodeKey)
    }
    nextNodeKeys = append(nextNodeKeys, t.call.writeTo...)  // 数据边目标总是成立

    // 写进 writeChannelValues[目标][来源] = 值
    for i, next := range nextNodeKeys {
        if writeChannelValues[next] == nil {
            writeChannelValues[next] = make(map[string]any)
        }
        writeChannelValues[next][t.nodeKey] = vs[i]
    }
}
{% endhighlight %}

产出被组织成一个二维 map：`writeChannelValues[下游节点][上游节点] = 值`。为什么要记「来源」？因为 fan-in 时一个节点有多个上游，channel 要知道这个值是谁给的、该不该算进汇聚（第 06 篇）。

分支求值 `calculateBranch`：非流式下调用 `branch.invoke(ctx, input)`，拿到条件函数返回的目标节点 key 列表；流式下用 `branch.collect`（先把流 concat 成值再判断）。条件没选中的分支目标会进 `skippedNodes`，通知 channel 这些节点「被跳过了，别再等」：

{% highlight go %}
if isStream {
    ws, err = branch.collect(ctx, input[i].(streamReader))
} else {
    ws, err = branch.invoke(ctx, input[i])
}
// ... 对比 branch.endNodes 白名单，没被选中的进 skippedNodes
err := cm.reportBranch(curNodeKey, skippedNodeList)
{% endhighlight %}

### (2) channelManager.updateAndGet：谁就绪了？

把产出写进对应 channel，然后问每个 channel「你就绪了吗」：

{% highlight go %}
func (c *channelManager) updateAndGet(ctx context.Context,
    values map[string]map[string]any, dependencies map[string][]string) (map[string]any, error) {

    if err := c.updateValues(ctx, values); err != nil { return nil, ... }
    if err := c.updateDependencies(ctx, dependencies); err != nil { return nil, ... }
    return c.getFromReadyChannels(ctx)
}
{% endhighlight %}

`updateValues` 有个关键过滤：**只接收数据前驱送来的值**，其他来源（比如控制边、被跳过的分支）的值直接 close 丢弃：

{% highlight go %}
for from, value := range fromMap {
    if _, ok = dps[from]; ok {           // dps = dataPredecessors[target]
        nFromMap[from] = fromMap[from]
    } else {
        if sr, okk := value.(streamReader); okk { sr.close() }  // 不是数据前驱，丢弃
    }
}
toChannel.reportValues(nFromMap)
{% endhighlight %}

`getFromReadyChannels` 遍历所有 channel，调 `ch.get(...)`，返回 `ready=true` 的节点，并在出 channel 后过一遍 **preNode handler**（字段映射、`WithStatePreHandler` 都在这一层）：

{% highlight go %}
for target, ch := range c.channels {
    v, ready, err := ch.get(c.isStream, target, c.edgeHandlerManager)
    if ready {
        v, err = c.preNodeHandlerManager.handle(target, v, c.isStream)  // state preHandler 在此
        result[target] = v
    }
}
{% endhighlight %}

`ch.get` 的就绪判断逻辑，Pregel 和 DAG 不同（Pregel 来值即触发，DAG 等齐所有前驱），这是第 06 篇的重点。

### (3) createTasks：就绪节点变成 task

{% highlight go %}
for nodeKey, nodeInput := range nodeMap {
    call, ok := r.chanSubscribeTo[nodeKey]
    // ...
    nextTasks = append(nextTasks, &task{
        ctx:     AppendAddressSegment(taskCtx, AddressSegmentNode, nodeKey),
        nodeKey: nodeKey,
        call:    call,
        input:   nodeInput,
        option:  taskOpts,
    })
}
{% endhighlight %}

就是查第 04 篇编译好的 `chanSubscribeTo` 表，把就绪节点包成 `task`。注意这里**只是造任务对象，还没执行**。

## taskManager：并发执行

`submit` 负责跑任务。它先跑每个任务的 **preHandler**（`WithStatePreHandler` 之外，还有 state 读写前置逻辑），成功的才进执行集：

{% highlight go %}
err := runPreHandler(currentTask, t.runWrapper)
// ...
t.runningTasks[currentTask.nodeKey] = currentTask
{% endhighlight %}

然后决定同步还是并发。有个很务实的优化：**当没有其他在跑任务、且新任务只有一个（或 needAll 模式）时，直接在当前 goroutine 同步执行**，省掉一次 goroutine 调度：

{% highlight go %}
var syncTask *task
if t.num == 0 && (len(tasks) == 1 || t.needAll) && t.cancel == nil {
    syncTask = tasks[0]
    tasks = tasks[1:]
}
for _, currentTask := range tasks {
    t.num += 1
    go t.execute(currentTask)   // 其余并发
}
if syncTask != nil {
    t.num += 1
    t.execute(syncTask)         // 第一个同步跑
}
{% endhighlight %}

`execute` 里真正调用组件，并用 `defer` 把 panic 转成 task 的 error，保证一个节点炸了不会拖垮整个调度器：

{% highlight go %}
func (t *taskManager) execute(currentTask *task) {
    defer func() {
        if panicInfo := recover(); panicInfo != nil {
            currentTask.output = nil
            currentTask.err = safe.NewPanicErr(panicInfo, debug.Stack())
        }
        close(currentTask.finished)
        t.done.Send(currentTask)
    }()
    ctx := initNodeCallbacks(currentTask.ctx, currentTask.nodeKey,
        currentTask.call.action.nodeInfo, currentTask.call.action.meta, t.opts...)
    currentTask.output, currentTask.err = t.runWrapper(ctx, currentTask.call.action, currentTask.input, currentTask.option...)
}
{% endhighlight %}

`runWrapper` 在非流式下是 `runnableInvoke`（调 `action.i`），流式下是 `runnableTransform`（调 `action.t`）。`initNodeCallbacks` 把这个节点的 RunInfo 塞进 ctx——第 07 篇 callbacks 靠它知道「现在在跑哪个节点」。

`wait` 对应两种模式：

- **needAll（DAG / Workflow，eager=true 时反而 needAll=!eager…… 实际 DAG 下等齐本批）**：`waitAll()` 等这一批全部完成，一起返回——配合「所有前驱到齐才触发」的 DAG 语义。
- **Pregel（eager）**：`waitOne()` 来一个完成的就返回，立刻推进——配合「来值即触发」，能尽早跑下游。

## 一次 Invoke 的完整时序

把上面串起来，一条 `prompt → model → parser` 的 Chain，`Invoke` 时：

1. `run` 初始化 cm/tm，造 START 虚拟任务。
2. `calculateNextTasks([START])`：START 的产出写进 model 的 channel → model 就绪 → 返回 `[task(model)]`。
3. 循环：`submit([model])`（单任务，同步执行）→ model 调 LLM 返回 `*schema.Message` → `wait()` 返回 `[task(model) 完成]`。
4. `calculateNextTasks([model完成])`：model 产出写进 parser channel → parser 就绪 → `[task(parser)]`。
5. `submit([parser])` → parser 产出 → `calculateNextTasks` 这次写进 END channel → `nodeMap[END]` 命中 → `isEnd=true`，返回 parser 的输出。

分支/并发只是让某一步 `nextTasks` 里有多个 task（并发跑），或 `calculateBranch` 选中不同下游；环则让某个节点在多轮循环里重复出现，直到分支选 END 或撞上 maxRunSteps。

## 设计取舍

- **邮箱模型（channel per node）解耦调度与执行**：节点不直接调用下游，只把产出丢进下游邮箱。要不要触发、怎么汇聚，全由下游 channel 自己判断。这让并发、fan-in、分支跳过、环全部退化成「channel 就绪逻辑」的差异，主循环无需感知拓扑形状。
- **编译期算拓扑，运行期只查表**：`chanSubscribeTo`、前驱映射都是编译期备好的；运行期 hot path 是 map 查找 + channel 就绪判断，没有反射、没有图遍历。
- **同步快路径 + panic 兜底**：单任务同步执行省 goroutine；`execute` 的 defer 把节点 panic 变成普通 error，错误处理和节点失败统一。
- **eager 与 needAll 的对立**：Pregel「来一个推一个」换取低延迟（Agent 场景下边生成边推进），DAG「等齐再推」换取确定性汇聚。两种模式复用同一个循环，只差 channel 实现和 wait 策略。

## 自己动手

- [ ] 在 `calculateNextTasks` 入口打印 `completedTasks` 的 nodeKey，跑一条三节点 Chain，观察「START → node1 → node2 → END」的批次序列。
- [ ] 造一个两个节点并发汇入第三个节点的图，观察某一批 `nextTasks` 里同时有两个 task、`wait` 返回顺序不确定。
- [ ] 在某个节点函数里 `panic("boom")`，观察图返回的是包装后的 error 而不是整个进程崩溃。
- [ ] 对比 `WithNodeTriggerMode(AllPredecessor)` 加与不加时，并发汇聚节点被触发的次数（DAG 等齐触发一次 vs Pregel 每个上游触发一次）。

---

*上一篇：[04 · Compile：把一张图编译成可执行对象]({{ site.baseurl }}{% post_url 2026-09-04-eino-04-compile %}) · 下一篇：06 · 运行时（下）—— 流式 fan-in / fan-out 与 Pregel channel。*
