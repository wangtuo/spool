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
    {% assign posts = site.posts | where: "series", "eino 源码分析" | sort: "date" %}
    {% for post in posts %}
    <div class="ep">
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p class="ep-meta">关键词：{{ post.tags | join: "、" }}</p>
      <p>{{ post.description }}</p>
    </div>
    {% else %}
    <p>文章即将发布。</p>
    {% endfor %}
  </div>

  <h2>约定</h2>
  <ul>
    <li>所有文章基于分析时锁定的 eino 版本，文首标注 <code>source_version</code>（commit/tag）。</li>
    <li>代码引用给出 <code>包路径.符号</code>，可直接在 IDE 跳转。</li>
    <li>每篇末尾留「自己动手」：一个可运行的最小验证实验。</li>
  </ul>
</article>
