---
layout: default
title: 编码与存储系列
description: 数据编码、压缩、列式存储与内存格式的底层原理
permalink: /series/encoding-storage/
---
<article>
  <header class="post-header">
    <h1 class="post-title">编码与存储系列</h1>
    <p class="post-meta">主题：数据编码、压缩、列式存储、内存格式</p>
  </header>

  <blockquote>
    <p>数据在内存里和磁盘上，设计目标几乎相反。这个系列聊清楚编码与存储的底层原理——从整型数组的 varint/delta/bit-packing，到列式存储的嵌套结构，再到压缩算法的实际取舍。</p>
  </blockquote>

  <h2>系列目录</h2>

  <div class="series-toc">
    {% assign posts = site.posts | where: "series", "编码与存储" | sort: "date" %}
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
</article>
