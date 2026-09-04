---
layout: default
title: eino 源码分析系列
description: 逐行读 CloudWeGo eino —— Go 的 LLM 应用开发框架，从组件抽象到 Graph 编排、流式与回调机制
permalink: /series/eino/
---

<article>
  <header class="post-header">
    <h1 class="post-title">eino 源码分析系列</h1>
    <p class="post-meta">对象：<a href="https://github.com/cloudwego/eino">cloudwego/eino</a> · 语言：Go · 读法：自底向上，先机制后用法</p>
  </header>

  <blockquote>
    <p>读源码不是为了背 API，而是回答三个问题：<strong>它抽象了什么、为什么这样抽象、代价是什么</strong>。
    eino 是 CloudWeGo 出的 LLM 应用框架，核心价值在于把「模型 / 工具 / 检索 / 编排 / 流式 / 可观测」收敛成一套统一的组件与图编排模型。
    本系列按依赖顺序从底层接口一路读到上层编排与扩展。</p>
  </blockquote>

  <h2>怎么读这个系列</h2>
  <p>每一篇都遵循固定结构：<strong>要解决的问题 → 关键接口/类型 → 核心代码路径 → 设计取舍 → 自己动手验证</strong>。
  建议配合本地 clone 的 eino 源码对照阅读，文章里给出包路径与关键符号。</p>

  <h2>系列目录</h2>

  <div class="series-toc">

    <div class="ep">
      <h3>00 · 开篇：eino 想解决什么问题</h3>
      <p class="ep-meta">关键词：定位、与 LangChain/LlamaIndex 的差异、整体分层</p>
      <p>从一个手写 LLM 调用的痛点出发，讲清 eino 的两大支柱——<strong>Components（组件抽象）</strong>与 <strong>Compose（图编排）</strong>——以及 repo 的目录地图：<code>components/</code>、<code>compose/</code>、<code>flow/</code>、<code>callbacks/</code>、<code>schema/</code>、<code>einoext</code>。</p>
    </div>

    <div class="ep">
      <h3>01 · schema：消息与流式的统一数据模型</h3>
      <p class="ep-meta">关键词：<code>schema.Message</code>、<code>StreamReader</code>、<code>ConcatMessages</code></p>
      <p>所有组件流动的都是 <code>schema.Message</code>。重点读流式的基石 <code>stream.StreamReader</code>：它如何用 channel + 泛型封装「可接收/可拷贝/可拼接」的流，以及为什么消息帧需要 <code>Concat</code> 语义（增量 chunk 合并成完整消息）。</p>
    </div>

    <div class="ep">
      <h3>02 · components：组件接口的抽象哲学</h3>
      <p class="ep-meta">关键词：<code>ChatModel</code>、<code>Tool</code>、<code>Retriever</code>、<code>Embedder</code>、Interface Slice 模式</p>
      <p>eino 不给基类，只给极小接口。读 <code>components/model/chat_template.go</code> 等，看它如何用「同一能力的多个变体接口」（生成/流式/回调）组合出组件契约，以及 <code>Components</code> 元数据如何被编排层用来做类型检查。</p>
    </div>

    <div class="ep">
      <h3>03 · compose 基础：Chain 与 Graph 的拓扑构建</h3>
      <p class="ep-meta">关键词：<code>NewChain</code>、<code>NewGraph</code>、<code>AddChatModel</code>、<code>AddEdge</code>、字段映射</p>
      <p>进入编排核心。看链式/图式两种 builder 如何把节点和边登记成一张内部拓扑表，节点输入输出如何通过结构体字段做数据映射（<code>map[field]field</code>），以及编译前做了哪些静态校验。</p>
    </div>

    <div class="ep">
      <h3>04 · 编译期：Compile 如何把图变成可执行对象</h3>
      <p class="ep-meta">关键词：<code>Compile</code>、<code>Runnable</code>、类型推断、<code>composableRunnable</code></p>
      <p>这是全系列最硬的一篇。跟踪 <code>graph.Compile()</code>：如何做端到端的类型检查（Go 泛型 + 反射）、如何把每个节点包装成统一的 <code>Runnable</code>、如何预处理字段映射与状态读写，最终产出一个 <code>Invoke/Stream/Collect/Transform</code> 四态可执行体。</p>
    </div>

    <div class="ep">
      <h3>05 · 运行时（上）：一次 Invoke 的完整调用链</h3>
      <p class="ep-meta">关键词：<code>Runnable.Invoke</code>、节点调度、channel 传递、<code>state</code></p>
      <p>从 <code>runnable.Invoke(ctx, input)</code> 进入，逐帧看数据如何在节点间流动：输入如何按映射分发、节点如何被并发调度、<code>StatePreHandler/PostHandler</code> 如何读写共享状态。配合一个最简 Graph 打日志验证执行顺序。</p>
    </div>

    <div class="ep">
      <h3>06 · 运行时（下）：流式的自动拼装与 fan-in/out</h3>
      <p class="ep-meta">关键词：<code>Stream</code>、<code>Collect</code>、<code>Transform</code>、<code>StreamReader</code> 合并、分支</p>
      <p>einoo 最有特色的部分：无论节点本身是否支持流式，编排层都能自动在「整值 ↔ 流」之间转换。读 <code>Stream</code> 模式下如何把非流式节点包出流式、多上游流如何 fan-in 拼接（<code>concat</code>）、<code>Branch</code> 如何按条件选择下游。</p>
    </div>

    <div class="ep">
      <h3>07 · callbacks：面向切面的可观测与拦截</h3>
      <p class="ep-meta">关键词：<code>callbacks.Handler</code>、<code>ctx</code> 注入、<code>OnStart/OnEnd/OnError</code>、流式回调</p>
      <p>eino 不靠中间件，而是把回调塞进 <code>context.Context</code>。读 handler 如何在节点执行前后被触发、如何透传嵌套（图里套图/chain）、流式场景下 <code>OnStartWithStreamInput</code> 等变体如何工作，以及它如何支撑 tracing/metrics/日志。</p>
    </div>

    <div class="ep">
      <h3>08 · Lambda 与自定义节点：把任意函数接进图</h3>
      <p class="ep-meta">关键词：<code>compose.InvokableLambda</code>、<code>StreamableLambda</code>、<code>AnyLambda</code>、函数签名推断</p>
      <p>当内置组件不够用时如何接自己的 Go 函数。读 Lambda 如何通过反射解析函数签名、自动判断它是 Invoke/Stream/Transform 哪种形态、如何参与同一套类型检查与流式拼装。</p>
    </div>

    <div class="ep">
      <h3>09 · einoext 与 ReAct Agent：把机制组装成应用</h3>
      <p class="ep-meta">关键词：<code>einoext/components/model</code>、<code>flow/agent</code>、ReAct、ToolNode</p>
      <p>从框架走向应用。看官方扩展如何实现 OpenAI/Ark 等具体 <code>ChatModel</code>，以及 <code>flow/agent/react</code> 如何用底层 Graph + Branch + Tool 拼出一个「思考-调用工具-再思考」循环，理解框架抽象如何落到真实 Agent。</p>
    </div>

    <div class="ep">
      <h3>10 · 收尾：设计取舍复盘与自研借鉴清单</h3>
      <p class="ep-meta">关键词：泛型 vs 接口、编译期检查的代价、流式抽象的边界、可演进性</p>
      <p>站在架构师视角复盘：eino 用「重编译期、轻运行时」换来的类型安全值不值？流式四态统一的复杂度成本在哪？如果自己要设计一个 LLM 编排框架，哪些可以直接抄、哪些要按团队场景重做。</p>
    </div>

  </div>

  <h2>约定</h2>
  <ul>
    <li>所有文章基于分析时锁定的 eino 版本，文首标注 <code>source_version</code>（commit/tag）。</li>
    <li>代码引用给出 <code>包路径.符号</code>，可直接在 IDE 跳转。</li>
    <li>每篇末尾留「自己动手」：一个可运行的最小验证实验。</li>
  </ul>
</article>
