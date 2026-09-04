---
layout: default
title: 系列
permalink: /series/
---
<article>
  <header class="post-header">
    <h1 class="post-title">系列</h1>
  </header>

  {% assign all_posts = site.posts | sort: "date" | reverse %}
  {% for s in site.data.series %}
    {% assign sposts = all_posts | where: "series", s.title %}
    <section class="series-group">
      <h2 class="series-group-title">
        <a href="{{ s.permalink | relative_url }}">{{ s.title }}</a>
      </h2>
      <p class="post-excerpt">
        {% if sposts.size > 0 %}
          {{ sposts.size }} 篇
        {% else %}
          即将开始
        {% endif %}
      </p>
    </section>
  {% endfor %}
</article>