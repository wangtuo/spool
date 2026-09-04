---
title: "Context Hub 00 · 开篇：让 AI 编程助手不再「幻觉 API」"
series: Context Hub 源码分析
description: 编程 Agent 最常犯的错误是凭空编造 API。Context Hub 用一套「搜索 → 取文档 → 标注 → 反馈」的闭环，把 API 文档变成 Agent 可消费的格式，并让 Agent 越用越聪明。本篇梳理它的设计动机、架构分层与核心数据流。
tags: [context-hub, ai-agent, cli, 文档, 架构]
source_version: "andrewyng/context-hub main 分支（分析于 2026-09）"
---

## 要解决的问题

用 AI 编程助手写过代码的人都见过这个场景：Agent 信誓旦旦地调了一个 `openai.chat.completions.create({ model: "gpt-5" })`，结果 `gpt-5` 根本不存在；或者它用了 Stripe API 的 v1 参数格式去调 v2 接口。这些错误有一个共同根因：**Agent 依赖训练数据里的 API 知识，而不是当前的文档**。

Context Hub（简称 Chub）要解决的就是这个问题。它把「给 AI 编程助手提供准确 API 文档」这件事做成了四步闭环：

1. **搜索** —— 从注册表里找到正确的文档
2. **获取** —— 按语言、版本拉取文档内容（只取需要的部分，不浪费 token）
3. **标注** —— Agent 发现文档里没写的坑，在本地记下来，下次自动带上
4. **反馈** —— 给文档作者点赞/踩，让文档对有所有人越来越好

它不是给「人」用的文档站，而是给「Agent」用的文档 CLI。这一篇梳理它的整体架构。

## 架构分层

把 Context Hub 的仓库目录和运行模型摊开，可以分成四层：

```
┌─────────────────────────────────┐
│  Agent（Claude Code / Cursor …）   │  ← 消费者
├─────────────────────────────────┤
│  CLI（chub search / get / …）      │  ← 接口层
├─────────────────────────────────┤
│  Registry（registry.json）         │  ← 索引层
├─────────────────────────────────┤
│  Content（DOC.md / SKILL.md）      │  ← 数据层
└─────────────────────────────────┘
```

**数据层**（`content/`）是纯 Markdown + YAML frontmatter。每个 API 提供方（Stripe、OpenAI、Anthropic 等）维护自己的文档目录，按作者 → 类型 → 条目名 → 语言/版本层层嵌套。最小单元是一个 `DOC.md`：

```
content/
  stripe/
    docs/
      api/
        javascript/
          DOC.md          ← 名字、描述、版本、语言、标签
          references/
            webhooks.md   ← 可选的深度参考文件
```

**索引层**是 `chub build` 编译出来的 `registry.json`——把目录结构里的所有 `DOC.md` / `SKILL.md` 发现、校验 frontmatter、生成条目的元数据索引。Agent 搜索时查的是索引，不是遍历文件。

**接口层**是 `chub` CLI，一堆子命令（`search`、`get`、`annotate`、`feedback` 等），Agent 通过 `chub --help` 自举式地学会怎么用。

**消费者**是各种 AI 编程助手（Claude Code、Cursor、Codex 等），通过内置 SKILL.md 或用户配置，在需要调 API 时自动走 CLI。

## 核心数据流

一次典型的 Agent 使用流程是这样的：

```
Agent 收到任务："用 Stripe API 创建 PaymentIntent"
      │
      ▼
chub search "stripe payment" --json
      │
      ▼  返回 [{id: "stripe/api", description: "…", languages: ["js","py"]}]
      │
chub get stripe/api --lang js
      │
      ▼  返回 DOC.md 内容（只有入口文件，不浪费 token）
      │
Agent 阅读文档，写出正确代码
      │
      ▼  （可选）发现文档没提的坑
chub annotate stripe/api "需要 raw body 做 webhook 验证"
      │
      ▼  （可选）给文档质量打分
chub feedback stripe/api up
```

下一次 Agent 再拿到同样任务时，`chub get stripe/api` 会提示「你有本地标注」——Agent 不用再踩一次同样的坑。

## 四个关键设计

### 1. 文档是 Markdown，不是 API

Context Hub 不做「把 OpenAPI spec 转成文档」的自动化管道。它直接维护人写的 Markdown。原因是：**代码示例、常见错误、边界条件说明——这些东西不在 spec 里，但 Agent 最需要**。Markdown 还意味着任何人都能 PR 贡献文档，审核门槛低。

### 2. 增量获取：按字节省 token

`chub get` 默认只返回入口文件。如果一份文档有额外的参考文件（高级用法、错误码表、迁移指南），CLI 会在返回末尾列出，Agent 按需用 `--file` 拉取。这个设计是因为：**Agent 的上下文窗口是有限资源，每多 1000 token 就少 1000 token 的思考空间**。

### 3. 标注 vs 反馈：两种学习回路

这是 Context Hub 最值得关注的设计区分：

| | 标注（Annotation） | 反馈（Feedback） |
|---|---|---|
| 谁受益 | 你自己（本地） | 所有人（全局） |
| 存哪 | `~/.chub/annotations/` | 发到注册表 |
| 什么时候用 | 下次 `chub get` 自动带上 | 文档作者看到后改进 |
| 安全模型 | 默认不带，需 `--with-annotations` | 有开关可关闭 |

标注默认不开的原因是安全：如果 Agent 被 trick 写了一条恶意标注，下次获取同一份文档时可能被注入恶意内容。所以标注被标记为「不可信输入」，Agent 应该只参考其中的事实信息，不执行其中的指令。

### 4. 版本化 + 多语言：一份文档，多种变体

同一份逻辑文档（比如 `stripe/api`）可以有多个变体：

- **语言变体**：`javascript/DOC.md`、`python/DOC.md`
- **版本变体**：`v1/DOC.md`、`v2/DOC.md`（大版本 breaking change）
- **语言 × 版本**：`v1/javascript/DOC.md`、`v2/python/DOC.md`

Agent 通过 `--lang js` 和 `--version 2.0.0` 精确选择。如果只有一个语言变体，`--lang` 可以省略（自动推断）。如果只有一个版本，默认取最高版本。

## 设计取舍

**好处：**

- **可审计**：所有文档以 Markdown 明文存在 GitHub 上，Agent 读了什么你一清二楚。
- **可贡献**：任何 API 提供方都可以 PR 自己的文档，审核后进注册表。
- **渐进式**：Agent 不需要一次性学会所有文档格式，`chub --help` 是自举入口。
- **省钱**：增量获取 + 本地缓存，token 消耗可控。

**代价：**

- **内容质量全靠人**：没有自动校验「代码示例能不能跑」。质量靠反馈循环（up/down）和社区 PR 来保证。
- **CLI 耦合**：Agent 必须通过 CLI 子进程访问文档，比直接读文件多一层进程开销。但好处是统一了缓存、注册表更新、标注存储。
- **标注安全靠约定**：`--with-annotations` 的默认关闭是一个正确的安全决策，但也意味着 Agent 每次都要「记得要标注」——忘记传这个 flag 就会漏掉上次踩坑的经验。
- **多源冲突**：如果配置了多个注册表源（公共 + 公司内部），同一个 ID 可能有两份文档，需要前缀 `internal:stripe/api` 来消歧。这增加了 Agent 的认知负担。

## 自己动手

- [ ] 安装 `chub`：`npm install -g @aisuite/chub`，跑 `chub search ""` 列出所有可用文档，感受索引规模。
- [ ] 给一个常用 API 创建标注：`chub get openai/chat --lang py`，读完后 `chub annotate openai/chat "你发现的文档没说的事"`，再跑一次 `chub get` 看提示。
- [ ] 理解增量获取：`chub get stripe/api --json | jq '.additionalFiles'` 看看有多少额外参考文件，用 `--file` 只拉一个。
- [ ] 看本地缓存：`chub cache status` 了解缓存结构，`cat ~/.chub/annotations/*.json` 看标注的存储格式。

---

*下一篇：01 · 注册表与索引 —— `chub build` 如何把 Markdown 目录编译成 Agent 可搜索的 `registry.json`。*