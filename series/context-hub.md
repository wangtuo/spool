---
layout: default
title: Context Hub 源码分析系列
description: 逐行读 Andrew Ng 的 Context Hub —— 给 AI 编程助手提供准确 API 文档的 CLI 工具，从注册表索引到标注与反馈闭环
permalink: /series/context-hub/
---
<article>
  <header class="post-header">
    <h1 class="post-title">Context Hub 源码分析系列</h1>
    <p class="post-meta">对象：<a href="https://github.com/andrewyng/context-hub">andrewyng/context-hub</a> · 语言：TypeScript/Node.js · 读法：自顶向下，先架构后实现</p>
  </header>

  <blockquote>
    <p>读源码不是为了背 API，而是回答三个问题：<strong>它抽象了什么、为什么这样抽象、代价是什么</strong>。
    Context Hub 是 AI 编程助手的「文档中间件」——把散落在各处的 API 文档变成结构化、可搜索、可标注、可反馈的 Agent 可消费格式。
    本系列从架构总览开始，逐步深入到注册表、CLI、标注与反馈系统。</p>
  </blockquote>

  <h2>系列目录</h2>

  <div class="series-toc">
    {% assign posts = site.posts | where: "series", "Context Hub 源码分析" | sort: "date" %}
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
    <li>所有文章基于分析时锁定的 Context Hub 版本，文首标注 <code>source_version</code>。</li>
    <li>Content 目录结构给出 <code>content/author/docs/entry/</code> 路径，可直接在仓库中对照。</li>
    <li>每篇末尾留「自己动手」：一个可运行的最小验证实验。</li>
  </ul>
</article>