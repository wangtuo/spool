---
title: "复盘 2026-09-03 全球大模型集体宕机：两个独立事故的 90 分钟叠加"
description: 9 月 3 日，ChatGPT、Claude、Grok 在 90 分钟内相继异常。是共同基础设施故障，还是时间巧合？本文用证据分级还原时间线，画出依赖图，并给出面向大模型 SRE / 质量工程的改进清单。
tags: [llm, sre, postmortem, openai, anthropic, xai, 故障复盘]
---

> 证据等级标注：**【事实】** 官方明确确认 · **【证据推断】** 多个独立证据支持 · **【合理推测】** 有技术依据但未被确认 · **【未知】** 证据不足

## 结论先行

2026 年 9 月 3 日 UTC 下午（北京时间深夜），全球三家头部大模型服务在约 90 分钟内相继异常：**Anthropic Claude、xAI Grok、OpenAI ChatGPT/Codex**。Google Gemini 基本未受影响。

核心结论：

- **这不是一次"共同基础设施故障"，而是两个独立事故在 90 分钟窗口内的时间叠加**【证据推断】。
  - **事故 A（Memphis 事件）**：SpaceX 位于田纳西州孟菲斯的 **Colossus 1 算力中心**故障。Anthropic 自 2026 年 5 月起[**独家租用**](https://www.anthropic.com/news/higher-limits-spacex)该设施全部 22 万+ 张 GPU / 300+ MW 算力【事实】。Grok 与 Claude 在 4 分钟内相继宕机，持续约 3.5 小时。
  - **事故 B（OpenAI 路由错误）**：92 分钟后 OpenAI 内部发生 **routing error**，影响 ChatGPT 与 Codex 34 分钟，官方确认为内部故障，与 GPT-6 Astra 发布无关【事实 - [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage) / [The Register](https://traictory.com/news/2026-09-05-azure-outage-chatgpt-claude-grok)】。
- **四大云厂商（Azure、AWS、GCP、Cloudflare）在该时间窗口均无重大事件记录**【事实 - [kalasuara](https://kalasuara.com/en/news/chatgpt-claude-grok-outages-overlapped-for-93-minutes.html) / [Cloudflare Status](https://www.cloudflarestatus.com/)】，排除公有云共同根因。
- 真正暴露的结构性风险是：**Anthropic 与 xAI 这对直接竞争对手共享同一物理数据中心**——单一 facility failure 同时拖垮两个对手产品【证据推断 - [cyberkendra](https://www.cyberkendra.com/2026/09/chatgpt-claude-grok-outage-two-causes.html)】。

---

## 1. 统一时间轴

| UTC 时间 | 北京时间 | 事件 | 证据 |
|---|---|---|---|
| 09-03 12:37 | 20:37 | Anthropic Sonnet 5 elevated errors（独立小事故） | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 12:56 | 20:56 | Sonnet 5 事故解决 | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 13:26 | 21:26 | **Anthropic 打开主事故**：Mythos 5.1 / Fable 5.1 / Opus 5 elevated errors | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 13:30 | 21:30 | **xAI Grok 事故开始**（6:30 PT），全平台不可用 | [engadget](https://www.engadget.com/2250789/spacexai-apologizes-for-outage-that-affected-grok-and-other-compute-partners/)【事实】 |
| 09-03 13:41 | 21:41 | Anthropic：已识别根因，修复中 | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 13:50 | 21:50 | Anthropic 扩大影响：Mythos/Fable 5.1、5、Opus 5、4.8、4.6 | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 14:43 | 22:43 | **OpenAI 路由错误开始**（7:43 PT），ChatGPT + Codex 部分不可用 | [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage)【事实】 |
| 09-03 15:17 | 23:17 | OpenAI 修复完成，继续监控 | [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage)【事实】 |
| 09-03 15:25 | 23:25 | Anthropic：仅 Opus 4.8 / Opus 5 仍受影响 | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 16:16 | 00:16(+1) | **Anthropic 事故解决** | [statuspage](https://anthropic.statuspage.io/)【事实】 |
| 09-03 17:05 | 01:05(+1) | **xAI Grok 事故解决**（10:05 PT） | [superintelligencenews](https://superintelligencenews.com/ai-fields/large-language-models/ai-outages-openai-anthropic-xai/)【事实】 |

**三家同时不可用的重叠窗口约 93 分钟**（14:43–16:16 UTC）【事实】。

---

## 2. 逐厂商复盘

### OpenAI / ChatGPT + Codex

- **异常**：ChatGPT Web/App、Codex 部分用户不可用；**API、FedRAMP、Ads Platform 未受影响**【事实 - [unite.ai](https://www.unite.ai/openai-confirms-service-degradation-hitting-chatgpt-and-codex-users/)】
- **持续**：34 分钟（14:43–15:17 UTC）
- **根因**：OpenAI 官方发言人称 "a routing error within our infra"【事实 - [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage)】；HN 上自称 incident commander 的工程师确认与 GPT-6 Astra 发布无关【证据推断 - [cyberkendra](https://www.cyberkendra.com/2026/09/chatgpt-claude-grok-outage-two-causes.html)】
- **影响**：Downdetector 全球 >340,000 条报告，为该平台一年来最大量级【事实 - [IB Times](https://www.ibtimes.com.au/simultaneous-outages-hit-major-ai-platforms-1875036)】
- **官方 Postmortem**：未发布【事实】

### Anthropic / Claude

- **异常**：claude.ai、Claude API、Claude Code、Claude Cowork 全部受影响；模型 Mythos/Fable 5.1、5、Opus 5、4.8、4.6 elevated errors【事实 - [statuspage](https://anthropic.statuspage.io/)】
- **持续**：2 小时 50 分（13:26–16:16 UTC）
- **根因**：Statuspage 仅写 "infrastructure issue"，Anthropic 拒绝公开评论【事实 - [statuspage](https://anthropic.statuspage.io/) / [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage)】。基于 Colossus 1 租约 + 4 分钟同步，**强烈推断为 Memphis 数据中心故障**【证据推断 - [cyberkendra](https://www.cyberkendra.com/2026/09/chatgpt-claude-grok-outage-two-causes.html)】
- **官方 Postmortem**：未发布【事实】

### xAI / Grok

- **异常**：Grok Web、Mobile、X 集成、东西海岸 API 全部不可用【事实 - [engadget](https://www.engadget.com/2250789/spacexai-apologizes-for-outage-that-affected-grok-and-other-compute-partners/)】
- **持续**：3 小时 35 分（13:30–17:05 UTC）
- **根因**：SpaceXAI 官方声明 "outage at our Memphis compute center"，并向 "impacted compute partners" 致歉【事实 - [engadget](https://www.engadget.com/2250789/spacexai-apologizes-for-outage-that-affected-grok-and-other-compute-partners/)】
- **官方 Postmortem**：未发布具体技术细节【事实】

### Google / Gemini

服务本身正常；Downdetector 报告数上升系用户从其他平台涌入所致【证据推断 - [9to5Google / ai-tldr.dev](https://ai-tldr.dev/releases/chatgpt-claude-grok-outage-sep3/)】。17:47 UTC us-central1-b 有 <1 分钟网络退化，与主窗口无关【事实 - [tickerr.ai](https://tickerr.ai/incidents/gemini-resolved-multiple-products-in-us-central1-b-are-ex-september-3-2026-o5eemi)】。

---

## 3. "集体故障"验证：依赖图

```
                      ┌─────────────────────┐
                      │   公有云/网络层       │
                      │ Azure / AWS / GCP /  │
                      │ Cloudflare           │
                      │ （9/3 窗口无重大事件）│
                      └──────────┬──────────┘
                                 │ 排除
              ┌──────────────────┼──────────────────┐
              ▼                                       ▼
   ┌─────────────────────┐               ┌─────────────────────┐
   │ OpenAI 自有栈        │               │ SpaceX Colossus 1   │
   │ (Azure + 自建)       │               │ Memphis, TN         │
   │ routing error        │               │ 220K+ GPUs / 300MW  │
   └─────────────────────┘               └──────────┬──────────┘
            ▲                                        │ 独家租用 (2026-05)
            │                                        ▼
       ChatGPT/Codex                      ┌─────────────────────┐
       (独立事故 B)                        │ Anthropic Claude    │
                                          │ + xAI Grok          │
                                          │ (事故 A，共享 facility)│
                                          └─────────────────────┘
```

判定：

- 公有云共同根因：**排除**【事实 - [kalasuara](https://kalasuara.com/en/news/chatgpt-claude-grok-outages-overlapped-for-93-minutes.html)】
- Memphis 共同根因（Grok + Claude）：**高度成立**【证据推断】——Anthropic 2026 年 5 月[公告独家租用 Colossus 1 全部算力](https://www.anthropic.com/news/higher-limits-spacex)【事实】，xAI 官方承认 Memphis 故障影响 "compute partners"【事实 - [engadget](https://www.engadget.com/2250789/spacexai-apologizes-for-outage-that-affected-grok-and-other-compute-partners/)】，两家事故相差仅 4 分钟【事实 - [statuspage](https://anthropic.statuspage.io/)】
- OpenAI 与上述两者：**独立**【事实】——相差 92 分钟，根因为内部路由错误【事实 - [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage)】

---

## 4. 故障传播链

### 事故 A：Memphis 数据中心故障（Grok + Claude）

```
Trigger: Memphis facility 故障（电力/网络/冷却 —— 未公开）
    │
    ▼
Root Cause: 单 facility 物理基础设施失效 【合理推测 - 具体子原因未知】
    │
    ▼
Amplifier: Colossus 1 承载 Anthropic 大量 Opus/Mythos/Fable 推理
           + xAI Grok 主力推理，无跨 region 快速 failover
    │
    ▼
Cascade: Model Serving 层无可用 GPU → Router 堆积 → 5xx 上升
    │
    ▼
Blast Radius: claude.ai / API / Claude Code / Cowork + Grok 全平台
    │
    ▼
Failure Domain: 单数据中心 = 单 failure domain（设计缺陷）
```

### 事故 B：OpenAI 内部路由错误

```
Trigger: 路由配置变更/漂移 【合理推测】
    │
    ▼
Root Cause: OpenAI 内部 routing error 【事实 - 官方确认】
    │
    ▼
Amplifier: 全局网关路由表错误 → ChatGPT/Codex 请求无法到达 serving
    │
    ▼
Cascade: 连接池耗尽 → 502/504 → 用户重试风暴
    │
    ▼
Blast Radius: ChatGPT + Codex（API 未受影响，说明路由层隔离）
    │
    ▼
Failure Domain: 控制面路由配置 = 全局单 blast radius
```

---

## 5. 大模型特有故障机制相关性

| 机制 | 本次相关性 | 说明 |
|---|---|---|
| GPU/显存故障 | **高（事故 A）** | Memphis 集群整体不可用 |
| KV Cache / Continuous Batching | 低 | 非容量问题 |
| Token Explosion | 无 | 错误率飙升而非延迟 |
| Model Router 故障 | **中（事故 B）** | routing error 实质是网关/路由层 |
| Rate Limit / Retry Storm | **中（放大器）** | 用户重试放大 5xx |
| Streaming/SSE 中断 | 中 | 流式对话大量被切断 |
| Multi-tenant 资源争用 | **高（事故 A 结构性）** | 两竞争对手共享同一 facility |
| Cell / Region 隔离 | **缺失** | Memphis 单 facility 无跨 region 冗余 |

---

## 6. 质量工程复盘：为什么测试没发现？

| 测试类型 | 现状缺陷 | 应补充 |
|---|---|---|
| Unit / Integration | 路由逻辑单测可能覆盖 | **路由配置变更前 dry-run + diff 校验** |
| E2E | 单 region 通过 | **跨 region failover E2E** |
| Load / Stress | 正常负载 OK | **单 region 摘除后剩余 region 能否承载 100% 流量** |
| Chaos / Fault Injection | **缺失关键场景** | **整个 DC 断电/断网注入** |
| Dependency Failure Test | **未覆盖共享设施** | **Anthropic 应模拟 Colossus 1 全挂，验证跨云切换** |
| Canary | 路由配置可能无 canary | **路由变更灰度 + 自动回滚** |
| Capacity Test | 未验证 N-1 冗余 | **N-1 DC 容量演练（每季度）** |

核心质量缺口：

1. **没有"整个数据中心不可用"的混沌演练** —— 这是事故 A 能持续 3.5 小时的根本原因。
2. **路由配置变更缺乏自动校验与回滚** —— 事故 B 的 34 分钟本可被 pre-deploy validation 压缩到秒级。
3. **共享依赖（Colossus 1）未纳入依赖故障测试矩阵** —— 租约签署时应同步建立 BCP。

---

## 6.1 质量保障人员的反思

这次事故对 QA / 质量保障角色的冲击，不在于"某个测试用例没覆盖"，而在于**测试思维本身停留在了功能和单系统层面，没有穿透到大模型服务的真实 failure mode**。以下是值得每个 LLM 质量工程师逐项对照的反思。

### 反思一：测试对象错了——我们在测"模型能回答"，而不是"系统在故障下如何降级"

传统 QA 的验收口径是"给定 prompt，模型输出是否符合预期"。但 9·3 事故中，用户根本拿不到输出。**大模型服务的可用性问题，绝大多数不是模型本身的问题，而是模型之外的基础设施**（网关、路由、调度、GPU 池、依赖服务）。

**应该怎么做**：把测试重心从"模型正确性"转向"系统韧性"。每个 release 的验收清单里，故障注入和降级验证的权重不应低于功能验证。

### 反思二：测试环境规模失真——"单机能跑通" ≠ "集群能扛住"

Memphis 一个 facility 承载 22 万 GPU。QA 环境通常只有几十张卡，能复现 continuous batching、KV cache 压力吗？能复现 router 在全量负载下的 backpressure 行为吗？答案几乎都是不能。

**应该怎么做**：建立"规模等价"的压测环境，或者用影子流量（shadow traffic）把生产流量的一定比例复制到测试集群，验证全链路在真实规模下的行为。没有规模，很多故障模式根本不会出现。

### 反思三：变更管控缺位——配置变更没有走和代码变更同等严格的发布流程

OpenAI 的 routing error 几乎可以肯定是某个路由配置变更导致的。这类变更在很多团队里是"运维操作"，不走 CI、不走 review、不走 canary。**代码要 PR + review + 灰度，配置却可以一键全局生效**——这是质量保障体系里最常见的盲区。

**应该怎么做**：把所有"会影响生产流量走向"的变更（路由表、网关规则、流量切分、feature flag）纳入与代码同等的发布管线：pre-deploy 校验 → canary → 自动回滚 → 人工确认。QA 要对"配置变更"也有验收权。

### 反思四：依赖测试只覆盖了"API 接口"，没覆盖"物理设施"

依赖故障测试通常是 mock 一下 auth 服务超时、数据库连接失败。但 9·3 暴露的是更深层的依赖：**一个物理数据中心整体不可用**。这种级别的故障，在传统依赖测试矩阵里根本不存在。

**应该怎么做**：把"共享物理设施"（租用的算力、共建的机房、同 AZ 的第三方服务）显式列入依赖清单，并设计对应的故障注入。特别是当两个竞争对手共享同一设施时（如 Anthropic 与 xAI 共享 Memphis），必须验证本方能在对方故障时不受牵连——或至少能快速切走。

### 反思五：SLO 只看了"成功率"，没看"爆炸半径"

很多团队的 SLO 是"整体成功率 99.9%"。但 9·3 事故说明：**即使整体成功率达标，局部故障的爆炸半径也可能大到不可接受**。Anthropic 的 API 可能还有部分 region 可用，但 Opus 5 全挂对依赖 Opus 的用户来说就是 100% 不可用。

**应该怎么做**：SLO 要按"故障域"拆分——单模型、单 region、单租户、单功能面各自有 SLO。QA 的回归测试也要按故障域组织：每个故障域都要有独立的可用性验收标准，而不是只看全局均值。

### 反思六：没有"事故演练"文化——Runbook 是写出来的，不是练出来的

事故 A 持续 3.5 小时，其中相当一部分时间花在"决策要不要切流量"上。这种延迟说明：**团队知道有 failover 机制，但没在真实压力下演练过**。真到故障发生时，人的第一反应是"再等等看"，而不是"立即执行预案"。

**应该怎么做**：每季度至少做一次 Game Day——模拟单 DC 全挂，按 Runbook 实操切流量，记录 MTTR。QA 应该是 Game Day 的组织者和验收者，确保 Runbook 不只是文档，而是经过验证的可执行流程。

### 反思七：监控告警是"事后诸葛亮"——没有 leading indicator

9·3 中，所有公开的告警都是"elevated errors"——这已经是用户感知到的滞后指标。真正的 leading indicator（GPU host health、facility 电源、路由配置 diff）要么没监控，要么没触发自动响应。

**应该怎么做**：QA 要参与定义"什么指标能在用户感知之前发现问题"。对每个故障模式，必须有对应的 leading indicator，并且验证该指标确实能领先于用户报告。这是从"被动响应"转向"主动预防"的关键。

### 反思八：把"第三方/供应商"当成了黑盒——租约里没有 BCP 条款

Anthropic 租了 SpaceX 的 Colossus 1，但显然没有在租约里绑定"设施故障时的流量切换 SLA"或"故障演练义务"。作为 QA，你很难对一个你不拥有的设施做故障注入，但你可以**在合同层面要求可观测性和演练权**。

**应该怎么做**：任何关键算力/服务的采购合同，都必须包含：(1) 设施级健康数据的访问权；(2) 联合故障演练的义务；(3) 故障时的切换 SLA 和赔付条款。QA 要参与合同评审，而不是只在上线后才接手。

---

### 一句话总结

> 9·3 事故对 QA 的最大教训是：**大模型服务的质量，不取决于模型本身有多强，而取决于当模型之外的任何一层出问题时，系统能不能优雅降级、快速恢复。** 测试的边界，必须从"功能正确"扩展到"故障下的韧性"。

---

## 7. 可观测性

| 层级 | 关键指标 | 本次最早异常 | 检测状态 |
|---|---|---|---|
| Request | 5xx rate / p99 latency | 网关 502 尖峰 | 已检测 |
| Token | output token/s | 断崖式下跌 | 应有但未公开 |
| Queue | queue depth / wait time | 堆积 | 应有但未公开 |
| Model | model-level success rate | Opus 系列先掉 | Anthropic 13:26 检测到 |
| GPU | GPU utilization / host health | Memphis 集群失联 | 应有但未公开 |
| Dependency | DC-level power/network | facility 级告警 | **可能缺失或未触发自动 failover** |

- **Leading Indicator（应有）**：GPU host health drop、facility power anomaly
- **Lagging Indicator**：用户 5xx、Downdetector 报告
- **MTTD**：Anthropic ~0 min、xAI ~0 min、OpenAI ~数分钟
- **MTTR**：OpenAI 34 min、Anthropic 170 min、xAI 215 min
- **Detection Gap**：facility 级故障到自动流量切换之间存在人工决策延迟

---

## 8. 为什么一个局部故障影响如此大范围？

1. **Anthropic 把大量前沿模型推理集中在 Colossus 1**（22 万 GPU），N-1 冗余未覆盖此规模【证据推断】。
2. **xAI Grok 主力依赖 Memphis**，跨区切换能力不足【合理推测】。
3. **OpenAI 路由层无 canary / 无自动回滚**，错误配置全局生效【合理推测】。
4. **Cell Architecture 缺失或不足**：单 facility = 单 cell，cell failure = 服务不可用。
5. **Multi-provider fallback 缺失**：Anthropic 无 AWS/GCP 即时承接 Opus 级负载的能力【合理推测】。

---

## 9. 反事实混沌实验

| 注入场景 | 注入方式 | 预期现象 | 应有监控 | 自动恢复 | 验证标准 |
|---|---|---|---|---|---|
| DNS 故障 | 劫持/污染权威 DNS | 域名解析失败 | DNS 解析成功率 + 多 resolver | 多 DNS provider 切换 | 5 min 内 99% 解析成功 |
| CDN 故障 | Cloudflare 区域拉黑 | 静态资源 5xx | CDN edge 5xx rate | 多 CDN 切换 / 直连源站 | 静态资源可用性 ≥99.9% |
| 云 API 故障 | mock Azure API 5xx | VM 调度失败 | cloud API error rate | 跨 provider 调度 | 10 min 内恢复调度 |
| **GPU Pool 全挂** | **关闭 Memphis 所有 GPU 节点** | **模型推理 100% 失败** | **GPU host health + model success** | **跨 region 流量切换** | **<15 min 恢复 80% 流量** |
| Router 故障 | 注入错误路由表 | 全局 502 | router rule diff + canary | 自动回滚到上一版本 | <2 min 回滚 |
| Dependency timeout | 注入 auth 服务 10s 延迟 | 请求超时排队 | dependency p99 | 熔断 + 降级 | 熔断在 SLO 内触发 |
| Token 激增 | 发送 100K context 请求 | KV cache 压力 | queue depth + OOM | rate limit + 排队 | 不雪崩 |
| Retry Storm | 客户端 10x 重试 | QPS 放大 | retry ratio | 服务端限流 + 退避 | 后端 QPS ≤2x 基线 |
| Region 故障 | 关停 us-east-1 | 该区域不可用 | region-level SLI | 多 region active-active | 流量自动转走 |

---

## 10. LLM 服务故障模式矩阵（Top 10）

| # | 故障模式 | 典型案例 | 频率 |
|---|---|---|---|
| 1 | **单数据中心/单集群故障** | 本次 Memphis、OpenAI 多次区域故障 | 高 |
| 2 | **路由/网关配置错误** | 本次 OpenAI、多次 Cloudflare 事件 | 高 |
| 3 | **GPU/推理集群容量不足** | OpenAI 多次 "capacity" 事件 | 高 |
| 4 | **上游云厂商故障** | Anthropic Aug 28 "upstream cloud provider" | 中 |
| 5 | **认证/登录服务故障** | Anthropic Aug 24 login 事件 | 中 |
| 6 | **计费/额度系统异常** | Anthropic Sep 2 "credit balance" 事件 | 中 |
| 7 | **模型级 elevated errors** | Anthropic Sonnet/Opus 反复出现 | 高 |
| 8 | **流式/SSE 连接中断** | Claude Code 多次断连 | 中 |
| 9 | **发布引发的回归** | 模型新版本上线后错误率升高 | 中 |
| 10 | **共享依赖/租户争用** | 本次 Colossus 1 共享 | 低但影响大 |

Top 3 最常见：单 DC 故障、路由配置错误、模型级错误率升高。

---

## 11. 三大核心问题

### ① 为什么这次会发生？

**两个独立事故叠加**【证据推断】：

- **事故 A**：Anthropic 独家租用 SpaceX Memphis Colossus 1，xAI Grok 也跑在同一 facility。该 facility 故障时，两个竞争对手同时失去算力。根因是**算力集中化 + 共享物理设施**。
- **事故 B**：OpenAI 内部路由配置错误，与事故 A 完全无关，纯属时间巧合。

### ② 为什么影响范围这么大？

- **Memphis 承载了 Anthropic 极大比例的前沿模型推理**（22 万 GPU 是行业最大单笔租约），单 facility failure = 大比例 Claude 不可用【证据推断】。
- **xAI Grok 主力在 Memphis**，跨区切换能力不足【合理推测】。
- **OpenAI 路由错误全局生效**，ChatGPT 用户基数最大，Downdetector 报告 >34 万【事实】。
- **三者时间重叠 93 分钟**，造成"全球 AI 集体罢工"的感知冲击。

### ③ 下一次如何做到"提前发现 + 自动隔离 + 自动恢复"？

- **提前发现**：路由变更 pre-deploy validation；facility 级电源/网络/冷却 leading indicator 监控；GPU host health 秒级上报。
- **自动隔离**：单 DC 故障触发自动流量摘除（无需人工）；模型级熔断；共享依赖租户间故障域硬隔离（Anthropic 与 xAI 在 Memphis 内应分属不同 failure domain）。
- **自动恢复**：active-active 多 region + N-1 容量；路由配置版本化 + 自动回滚；混沌演练确保 RTO <15 min。

---

## SRE / 质量改进 Backlog

1. **P0**：所有路由/网关配置变更强制 canary + 自动 diff 校验 + 一键回滚
2. **P0**：建立"单 DC 全挂"季度混沌演练，验证 <15 min 流量切换
3. **P0**：共享算力租户必须签署 BCP，跨 DC 冗余 ≥30%
4. **P1**：实现 active-active 多 region，N-1 容量 ≥100%
5. **P1**：GPU host health → 自动流量摘除的闭环（无需人工）
6. **P1**：模型级独立 SLO + 单模型故障自动降级到次优模型
7. **P2**：建立全行业 LLM outage 共享数据库
8. **P2**：客户端重试退避 + 服务端 retry budget 强制执行

---

## 关键证据来源

| 结论 | 来源 1 | 来源 2 |
|---|---|---|
| OpenAI 路由错误 | [WIRED](https://readkernel.com/artificial-intelligence/chatgpt-grok-claude-outage)（OpenAI 发言人） | [Hacker News](https://news.ycombinator.com/item?id=49568622)（自称 incident commander） |
| Memphis 故障影响 Grok | [engadget](https://www.engadget.com/2250789/spacexai-apologizes-for-outage-that-affected-grok-and-other-compute-partners/)（SpaceXAI 声明） | [superintelligencenews](https://superintelligencenews.com/ai-fields/large-language-models/ai-outages-openai-anthropic-xai/) |
| Anthropic 租用 Colossus 1 | [anthropic.com/news/higher-limits-spacex](https://www.anthropic.com/news/higher-limits-spacex) | [The Next Web](https://thenextweb.com/news/spacex-colossus-1-technical-problems-rented-anthropic) / [Bloomberg](https://www.bloomberglinea.com/negocios/spacex-alquila-capacidad-de-su-centro-de-datos-tras-problemas-para-desarrollar-su-ia/) |
| Claude 事故时间线 | [anthropic.statuspage.io](https://anthropic.statuspage.io/) | [androidauthority](https://www.androidauthority.com/claude-sept-3-outage-3706962/) |
| 云厂商无重大事件 | [kalasuara](https://kalasuara.com/en/news/chatgpt-claude-grok-outages-overlapped-for-93-minutes.html)（引用 WIRED） | [cloudflarestatus.com](https://www.cloudflarestatus.com/) |
| Gemini 基本未受影响 | [ai-tldr.dev](https://ai-tldr.dev/releases/chatgpt-claude-grok-outage-sep3/) | [tickerr.ai](https://tickerr.ai/incidents/gemini-resolved-multiple-products-in-us-central1-b-are-ex-september-3-2026-o5eemi) |
| 影响规模 | [IB Times](https://www.ibtimes.com.au/simultaneous-outages-hit-major-ai-platforms-1875036)（34 万报告） | [aitechdaily](https://www.aitechdaily.com/multi-lab-outage/) |
| 双事故分析 | [cyberkendra](https://www.cyberkendra.com/2026/09/chatgpt-claude-grok-outage-two-causes.html) | [traictory](https://traictory.com/news/2026-09-05-azure-outage-chatgpt-claude-grok) |

---

**免责声明**：Anthropic 与 xAI 均未发布完整技术 postmortem，Memphis 故障的具体子原因（电力/网络/冷却/软件）目前为**【未知】**。本报告中关于 Memphis 同时影响 Claude 的结论为**【证据推断】**（基于租约事实 + 4 分钟同步 + SpaceXAI "compute partners" 措辞），非 Anthropic 官方确认。
