const { test, expect } = require("./fixtures");

const qualitySignals = {
  1: ["控制面", "数据面", "质量", "退出条件"],
  2: ["tokenizer", "Q/K/V", "O(n²)", "KV Cache"],
  3: ["teacher forcing", "causal mask", "故障注入", "生产"],
  4: ["ACL", "血缘", "manifest", "回滚"],
  5: ["BM25", "dense", "recall@5", "失败"],
  6: ["单变量", "groundedness", "引用", "trace"],
  7: ["go/no-go", "否决", "停止条件", "统计口径"],
  8: ["TTFT", "TPOT", "P50/P95/P99", "不能直接推广"],
  9: ["KV Cache", "continuous batching", "backpressure", "公平"],
  10: ["支持矩阵", "golden set", "取消", "fallback"],
  11: ["100 条", "20 条人工", "脱敏", "采样率"],
  12: ["prompt injection", "ACL", "误报", "残余风险"],
  13: ["故障域", "RPO/RTO", "幂等", "恢复证据"],
  14: [
    "模型",
    "容量",
    "质量归因",
    "权限",
    "恢复",
    "成本",
    "退出条件",
    "90 天",
    "trade-off",
    "unknown",
    "下一步实验",
  ],
};
const authoritativeHosts = new Set([
  "arxiv.org",
  "aws.amazon.com",
  "cloud.google.com",
  "developers.google.com",
  "docs.llamaindex.ai",
  "docs.nvidia.com",
  "docs.ragas.io",
  "docs.sglang.io",
  "docs.vllm.ai",
  "fullstackdeeplearning.com",
  "github.com",
  "huggingface.co",
  "inspect.aisi.org.uk",
  "karpathy.ai",
  "kserve.github.io",
  "learn.microsoft.com",
  "opentelemetry.io",
  "owasp.org",
  "pytorch.org",
  "sre.google",
  "speech.ee.ntu.edu.tw",
  "www.elastic.co",
  "www.nist.gov",
  "www.sbert.net",
]);

function article(page, number) {
  return page.getByRole("article", {
    name: new RegExp(`DAY ${String(number).padStart(2, "0")}`),
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test("automated structural audit covers all 14 rendered days without claiming human approval", async ({
  page,
}) => {
  const seenIds = new Set();
  for (let week = 1; week <= 2; week += 1) {
    await page.getByRole("button", { name: `第 ${week} 周` }).click({ force: true });
    await expect(page.locator("#dayList > article")).toHaveCount(7);

    for (let offset = 1; offset <= 7; offset += 1) {
      const number = (week - 1) * 7 + offset;
      const day = article(page, number);
      const id = `day-${String(number).padStart(2, "0")}`;
      seenIds.add(id);

      await expect(day).toContainText(`ID: ${id}`);
      const total = Number(
        (await day.locator(".budget-row").getAttribute("aria-label")).match(
          /共 (\d+) 分钟/,
        )[1],
      );
      expect(
        total,
        `${id} must fit the promised daily budget`,
      ).toBeGreaterThanOrEqual(90);
      expect(
        total,
        `${id} must fit the promised daily budget`,
      ).toBeLessThanOrEqual(120);

      for (const heading of [
        "学习目标",
        "实践步骤",
        "可观察产出",
        "通过标准",
        "检验与验收",
        "后续延伸",
      ]) {
        await expect(day).toContainText(heading);
      }
      await expect(day.getByRole("textbox")).toHaveCount(
        number === 14 ? 11 : 4,
      );
      await expect(day.getByText(/判断依据：|依据：/)).toBeHidden();

      const materials = day.locator(".material-list li");
      expect(
        await materials.count(),
        `${id} needs a small curated source set`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        await materials.count(),
        `${id} should not become a resource dump`,
      ).toBeLessThanOrEqual(3);
      for (let index = 0; index < (await materials.count()); index += 1) {
        const link = materials.nth(index).getByRole("link");
        const href = await link.getAttribute("href");
        const target = new URL(href);
        expect(target.protocol).toBe("https:");
        expect(
          authoritativeHosts,
          `${id} source identity must be an approved primary host`,
        ).toContain(target.hostname);
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noopener/);
        await expect(link).toHaveAttribute("rel", /noreferrer/);
        expect(
          (await materials.nth(index).locator("p").innerText()).length,
        ).toBeGreaterThan(20);
      }

      for (const signal of qualitySignals[number]) {
        await expect(
          day,
          `${id} must expose substantive ${signal} guidance`,
        ).toContainText(signal, { ignoreCase: true });
      }
    }
  }
  expect([...seenIds]).toEqual(
    Array.from(
      { length: 14 },
      (_, index) => `day-${String(index + 1).padStart(2, "0")}`,
    ),
  );
  await expect(page.locator("body")).not.toContainText(
    /60 个工作日|60 天计划|第 60 天/,
  );
  await expect(
    article(page, 14).getByText(
      /浏览器只验证结构与关键证据词，外部材料仍须由资深架构师人工复核/,
    ),
  ).toBeVisible();
});

test("Day 14 rejects a ceremonial sign-off and accepts an evidence-led architecture defense", async ({
  page,
}) => {
  await page.getByRole("button", { name: "第 2 周" }).click({ force: true });
  let day = article(page, 14);
  await expect(day.locator(".budget-row")).toHaveAttribute(
    "aria-label",
    "时间预算，共 110 分钟",
  );
  await expect(day).toContainText("至少 5 个明确 trade-off");
  await expect(day).toContainText("3 个未验证假设");

  await day
    .getByLabel("Day 14 问题 1 的回答")
    .fill("我们选择当前模型，因为效果不错。");
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await day.getByRole("button", { name: "提交 Day 14 验收" }).click({ force: true });
  await expect(day).toContainText("需补充");
  await expect(
    day.getByRole("list", { name: "Day 14 验收反馈" }),
  ).toContainText("容量推导不完整");
  await expect(page.getByText("0 / 14 天通过", { exact: true })).toBeVisible();

  day = article(page, 14);
  await day
    .getByLabel("Day 14 问题 1 的回答")
    .fill(
      "模型 model-a 与 runtime vLLM 基于 benchmark 的质量、P95、成本、许可证和数据边界胜出；备选 API 的 trade-off 是运维低但数据边界弱，退出条件是质量低于 85%。",
    );
  await day
    .getByLabel("Day 14 问题 2 的回答")
    .fill(
      "容量由峰值 QPS、输入输出 token 分布、服务时间、KV Cache 与实测单卡吞吐推导副本，并加入 N+1 故障余量；质量按数据、检索、上下文、模型、工具的 trace 归因。",
    );
  await day
    .getByLabel("Day 14 问题 3 的回答")
    .fill(
      "身份、tenant、ACL 在检索和工具端强制校验；攻击记录含残余风险。故障先降级再按 RPO/RTO 恢复并回滚。30/60/90 天优先级按风险和依赖排序。",
    );
  await day
    .getByLabel("Day 14 产出证据摘要")
    .fill(
      "ADR-014 第 2 节引用 benchmark run-42 的质量/P95 与许可证风险；capacity.xlsx 以 QPS、token、实测单卡吞吐推导副本和故障余量。权限图 sec-03 含身份 tenant ACL；攻击日志 attack-12 含误报和残余风险；演练记录 drill-09 含降级、恢复、RPO、RTO、回滚与退出条件。",
    );
  await day
    .getByLabel("5 个明确取舍（每行一个）")
    .fill(
      [
        "模型质量更高，但单请求成本增加 18%，选择 model-a 并以月预算为边界。",
        "自托管保障数据边界，但增加值班复杂度，选择 vLLM 并保留托管 API 回退。",
        "更长上下文提高召回覆盖，但 P95 增加 90ms，限制默认上下文为 8k。",
        "N+1 容量提高可用性，但 GPU 闲置成本增加，生产环境接受该余量。",
        "严格 ACL 降低泄露风险，但召回率下降 2%，安全优先并监控失败分类。",
      ].join("\n"),
    );
  await day
    .getByLabel("3 个未验证假设（每行一个）")
    .fill(
      [
        "reranker 在真实长尾 query 上仍能保持 MRR 收益，尚缺线上样本验证。",
        "峰值时 KV Cache 估算与实测偏差低于 10%，尚缺压力测试验证。",
        "租户 ACL 过滤不会显著增加 P95，尚缺跨租户负载验证。",
      ].join("\n"),
    );
  await day
    .getByLabel("下一步实验：唯一变量")
    .fill("只改变 reranker 版本 v1 到 v2");
  await day
    .getByLabel("下一步实验：控制项")
    .fill("固定 query 集、索引、模型、prompt 和硬件");
  await day.getByLabel("下一步实验：样本量").fill("100 个预先固定的 query");
  await day.getByLabel("下一步实验：成功阈值").fill("MRR 相对提升至少 5%");
  await day
    .getByLabel("下一步实验：停止条件")
    .fill("P95 超过 220ms 或错误率超过 1%");
  await day.getByRole("button", { name: "补充后重新提交 Day 14 验收" }).click({ force: true });

  await expect(day).toContainText("Day 14 已通过确定性完整性检查");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "第 2 周" }).click({ force: true });
  await expect(article(page, 14)).toContainText("已通过");
  await expect(
    article(page, 14).getByLabel("5 个明确取舍（每行一个）"),
  ).toHaveValue(/N\+1 容量/);
});

test("Day 14 rejects keyword stuffing and requires separately reviewable decisions", async ({
  page,
}) => {
  await page.getByRole("button", { name: "第 2 周" }).click({ force: true });
  const day = article(page, 14);
  for (let index = 1; index <= 3; index += 1)
    await day
      .getByLabel(`Day 14 问题 ${index} 的回答`)
      .fill(
        "benchmark 指标 风险 证据 模型 runtime QPS token KV Cache 副本 故障余量 数据 检索 上下文 工具 身份 tenant ACL 攻击 残余风险 降级 恢复 RPO RTO 回滚 退出条件 成本 30 60 90 优先级",
      );
  await day
    .getByLabel("Day 14 产出证据摘要")
    .fill(
      "benchmark 指标 风险 证据 trade-off 1 2 3 4 5 unknown 1 2 3 下一步实验 唯一变量 控制项 样本量 100 阈值 停止条件",
    );
  await day
    .getByLabel("5 个明确取舍（每行一个）")
    .fill("trade-off 1\ntrade-off 2\ntrade-off 3\ntrade-off 4\ntrade-off 5");
  await day
    .getByLabel("3 个未验证假设（每行一个）")
    .fill("unknown 1\nunknown 2\nunknown 3");
  await day.getByLabel("下一步实验：唯一变量").fill("唯一变量");
  await day.getByLabel("下一步实验：控制项").fill("控制项");
  await day.getByLabel("下一步实验：样本量").fill("100");
  await day.getByLabel("下一步实验：成功阈值").fill("阈值");
  await day.getByLabel("下一步实验：停止条件").fill("停止条件");
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await day.getByRole("button", { name: "提交 Day 14 验收" }).click({ force: true });
  const feedback = day.getByRole("list", { name: "Day 14 验收反馈" });
  await expect(feedback).toContainText("问题 1 像关键词清单");
  await expect(feedback).toContainText("第 1 个取舍缺少具体选择、收益与代价");
  await expect(feedback).toContainText("第 1 个未验证假设缺少可核验陈述");
  await expect(feedback).toContainText("下一步实验的唯一变量描述不足");
});

test("submission focuses the submitted day result when an earlier result exists", async ({
  page,
}) => {
  const state = {
    version: 2,
    days: {
      "day-11": {
        status: "needs-revision",
        answers: ["too short", "", ""],
        evidence: "",
        declaration: true,
        feedback: ["earlier feedback"],
      },
    },
  };
  await page.evaluate(
    (value) =>
      localStorage.setItem("llm-learning-progress", JSON.stringify(value)),
    state,
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "第 2 周" }).click({ force: true });
  const day = article(page, 14);
  await day
    .getByLabel("Day 14 问题 1 的回答")
    .fill("这是只针对当前模型选择的完整句子，但仍没有足够的其他答案。");
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await day.getByRole("button", { name: "提交 Day 14 验收" }).click({ force: true });
  await expect(day.locator(".review-feedback")).toBeFocused();
  await expect(article(page, 11).locator(".review-feedback")).not.toBeFocused();
});

test("100% is reserved for fourteen passed days and reset clears the release state", async ({
  page,
}) => {
  const state = { version: 2, days: {} };
  for (let number = 1; number <= 14; number += 1) {
    state.days[`day-${String(number).padStart(2, "0")}`] = {
      status: number === 14 ? "pending-review" : "passed",
      answers: [
        "reviewed answer one",
        "reviewed answer two",
        "reviewed answer three",
      ],
      evidence: "reviewed evidence",
      declaration: true,
      feedback: [],
    };
  }
  await page.evaluate(
    (value) =>
      localStorage.setItem("llm-learning-progress", JSON.stringify(value)),
    state,
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("13 / 14 天通过", { exact: true })).toBeVisible();
  await expect(page.getByText("93%", { exact: true })).toBeVisible();

  state.days["day-14"].status = "passed";
  await page.evaluate(
    (value) =>
      localStorage.setItem("llm-learning-progress", JSON.stringify(value)),
    state,
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("14 / 14 天通过", { exact: true })).toBeVisible();
  await expect(page.getByText("100%", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "重置进度" }).click();
  await page
    .getByRole("dialog", { name: "重置全部学习进度？" })
    .getByRole("button", { name: "确认重置" })
    .click();
  await expect(page.getByText("0 / 14 天通过", { exact: true })).toBeVisible();
  await expect(page.getByText("0%", { exact: true })).toBeVisible();
});
