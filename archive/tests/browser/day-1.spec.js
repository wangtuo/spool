const { test, expect } = require("./fixtures");

test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test("learner corrects an insufficient Day 1 submission and keeps the passed result after reload", async ({
  page,
}) => {
  let day = page.getByRole("article", { name: /DAY 01/ });

  await expect(day).toContainText("ID: day-01");
  await expect(day).toContainText("输入 25 分钟");
  await expect(day).toContainText("实践 55 分钟");
  await expect(day).toContainText("记录与验收 20 分钟");
  await expect(day.getByText(/判断依据：业务目标必须映射/)).toBeHidden();

  await day.getByLabel("问题 1 的回答").fill("画一张图。");
  await day.getByLabel("产出证据摘要").fill("做完了。");
  await expect(day).toContainText("进行中");
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await expect(day).toContainText("进行中");
  await day.getByRole("button", { name: "提交 Day 1 验收" }).click({ force: true });

  await expect(day).toContainText("需补充");
  await expect(day.getByRole("list", { name: "Day 1 验收反馈" })).toContainText(
    "问题 2 尚未回答",
  );
  await expect(day.getByRole("list", { name: "Day 1 验收反馈" })).toContainText(
    "问题 3 尚未回答",
  );
  await expect(page.getByText("0 / 14 天通过", { exact: true })).toBeVisible();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  day = page.getByRole("article", { name: /DAY 01/ });
  await expect(day).toContainText("需补充");
  await expect(day.getByLabel("问题 1 的回答")).toHaveValue("画一张图。");
  await expect(day.getByRole("list", { name: "Day 1 验收反馈" })).toContainText(
    "问题 2 尚未回答",
  );

  await day
    .getByLabel("问题 1 的回答")
    .fill(
      "数据面包含数据、模型、检索与推理请求链路；控制面负责配置、发布、评测和治理，两者通过版本化配置关联。",
    );
  await day
    .getByLabel("问题 2 的回答")
    .fill(
      "质量用固定评测集的任务成功率，目标 85%；P95 从 trace 采集，目标 2 秒；成本按 token 账单统计，目标每任务 0.2 元；可用性从网关成功率统计，目标 99.9%，任一超线就降级或退出。",
    );
  await day
    .getByLabel("问题 3 的回答")
    .fill(
      "先按 trace 定位 token、检索和模型成本，再尝试缓存、路由小模型与缩短上下文；代价是质量可能下降，因此用同一评测集回归并设置退出条件。",
    );
  await day
    .getByLabel("产出证据摘要")
    .fill(
      "README 已记录场景与边界；架构图标出数据面和控制面；指标表包含质量、P95、成本、可用性的目标值、数据来源、测量方法与退出条件。",
    );
  await day.getByRole("button", { name: "提交 Day 1 验收" }).click({ force: true });

  await expect(day).toContainText("已通过");
  await expect(day.getByText("Day 1 已通过确定性完整性检查")).toBeVisible();
  await expect(page.getByText("1 / 14 天通过", { exact: true })).toBeVisible();
  await expect(page.getByText("7%", { exact: true })).toBeVisible();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const restoredDay = page.getByRole("article", { name: /DAY 01/ });
  await expect(restoredDay).toContainText("已通过");
  await expect(restoredDay.getByLabel("问题 2 的回答")).toHaveValue(/P95/);
  await expect(restoredDay.getByLabel("产出证据摘要")).toHaveValue(/架构图/);
  await expect(
    restoredDay.getByText("Day 1 已通过确定性完整性检查"),
  ).toBeVisible();
  await expect(page.getByText("1 / 14 天通过", { exact: true })).toBeVisible();
});

test("legacy completed-day indexes are safely reset with an explicit explanation", async ({
  page,
}) => {
  await page.evaluate(() =>
    localStorage.setItem(
      "llm-learning-progress",
      JSON.stringify([0, 2, 2, 99]),
    ),
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#migrationNotice")).toContainText("旧版完成记录");
  await expect(page.locator("#migrationNotice")).toContainText("已安全重置");
  await expect(page.getByText("0 / 14 天通过", { exact: true })).toBeVisible();
});
