---
title: "eino 00 · 开篇：eino 想解决什么问题"
series: eino 源码分析
description: 从手写 LLM 调用的痛点出发，理清 eino 的两大支柱 Components 与 Compose，以及仓库目录地图。
tags: [eino, llm, go, 架构]
source_version: "v0.3.x（分析时锁定，见文末）"
---

> 这是系列的第一篇，也是写作模板。后续每篇都按「问题 → 接口 → 代码路径 → 取舍 → 动手」展开。

## 要解决的问题

直接用 SDK 调大模型时，代码很快会陷入：提示词拼接、工具调用循环、流式 chunk 合并、
检索增强、多模型切换、日志/tracing 散落各处……eino 试图用一套统一抽象收敛这些。

两大支柱：

- **Components（`components/`）**：把 ChatModel / Tool / Retriever / Embedder / Document Loader
  等定义为极小接口，只约定「输入是什么、输出是什么」。
- **Compose（`compose/`）**：把组件编排成 Chain / Graph，负责类型检查、数据流、流式拼装与回调注入。

## 仓库目录地图

| 路径 | 职责 |
|---|---|
| `schema/` | `Message` 等核心数据结构 |
| `components/` | 各类组件的接口定义 |
| `compose/` | Chain / Graph / Lambda 编排与编译运行时 |
| `flow/` | 基于编排封装的高阶能力（如 agent） |
| `callbacks/` | 切面式回调 Handler |
| `einoext/`（独立仓库） | 具体模型/组件实现与 agent 等扩展 |

## 核心代码路径

（待补充：贴 `compose.NewGraph` / `NewChain` 入口，追踪到 `Compile`。）

{% highlight go %}
// compose/chain.go （示意，分析时替换为真实代码）
func NewChain() *Chain { return &Chain{...} }
{% endhighlight %}

## 设计取舍

- 把大量检查放在**编译期**（`Compile` 用泛型 + 反射做类型推断），换取运行时更少的 panic。
- 代价是 builder API 略显「重」，初学曲线比 LangChain 陡。

## 自己动手

- [ ] clone eino，跑通官方 `examples` 里一个最简 Chain。
- [ ] 在 `Compile` 入口打断点/打印，观察节点拓扑表。

---

*下一篇：01 · schema —— 消息与流式的统一数据模型。*
