const { test, expect } = require('./fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test('Day 5 rejects weak evidence, accepts a reproducible retrieval baseline, and restores it', async ({ page }) => {
  let day = page.getByRole('article', { name: /DAY 05/ });

  await expect(day).toContainText('输入 25 分钟');
  await expect(day).toContainText('实践 55 分钟');
  await expect(day).toContainText('记录与验收 20 分钟');
  await expect(day).toContainText('Retrieval-Augmented Generation 原论文');
  await expect(day).toContainText('方法 2.1–2.2');

  await day.getByLabel('问题 1 的回答').fill('两者不同。');
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await day.getByRole('button', { name: '提交 Day 5 验收' }).click({ force: true });

  await expect(day).toContainText('需补充');
  await expect(day.getByRole('list', { name: 'Day 5 验收反馈' })).toContainText('问题 2 尚未回答');
  await expect(day.getByRole('list', { name: 'Day 5 验收反馈' })).toContainText('缺少“检索质量指标”');
  await expect(page.getByText('0 / 14 天通过', { exact: true })).toBeVisible();

  await day.getByLabel('问题 1 的回答').fill('BM25 擅长词法精确匹配，dense 擅长语义近邻；两类基线必须使用同一 query 集和 top-k。');
  await day.getByLabel('问题 2 的回答').fill('recall@5 衡量相关证据是否进入前五，MRR 衡量首个相关结果的倒数排名，二者分别反映覆盖和排序。');
  await day.getByLabel('问题 3 的回答').fill('先按失败分类核查语料、标注、权限和数据过期，再判断 embedding 是否造成召回不到或排序错误。');
  await day.getByLabel('产出证据摘要').fill('benchmark/run-05.md：固定 100 条 query，语料版本 corpus-v3、索引版本 idx-v2、环境 A10；BM25 与 dense 均报告 recall@5/10/20、MRR、P95；failures.csv 含 10 条召回不到、排序错误、权限错误和数据过期分类。');
  await day.getByRole('button', { name: '提交 Day 5 验收' }).click({ force: true });

  await expect(day).toContainText('已通过');
  await expect(day.getByText('Day 5 已通过确定性完整性检查')).toBeVisible();
  await expect(page.getByText('1 / 14 天通过', { exact: true })).toBeVisible();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  day = page.getByRole('article', { name: /DAY 05/ });
  await expect(day).toContainText('已通过');
  await expect(day.getByLabel('产出证据摘要')).toHaveValue(/corpus-v3/);
});

test('Day 6 exposes single-variable ablation and citation-verification requirements', async ({ page }) => {
  const day = page.getByRole('article', { name: /DAY 06/ });

  await expect(day.locator('.budget-row')).toHaveAttribute('aria-label', '时间预算，共 100 分钟');
  await expect(day).toContainText('每次 run 仅改变该变量');
  await expect(day).toContainText('至少三组相对同一基线的单变量消融');
  await expect(day).toContainText('人工抽检至少 20 条');
  await expect(day).toContainText('query→证据→prompt→答案→引用');
  await expect(day.getByRole('link', { name: /Ragas/ })).toHaveAttribute('rel', 'noopener noreferrer');
});

test('Day 7 cannot pass by declaration and requires a defensible go/no-go review', async ({ page }) => {
  let day = page.getByRole('article', { name: /DAY 07/ });

  await expect(day).toContainText('评审与决策 60 分钟');
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await day.getByRole('button', { name: '提交 Day 7 验收' }).click({ force: true });

  await expect(day).toContainText('需补充');
  await expect(day.getByRole('list', { name: 'Day 7 验收反馈' })).toContainText('问题 1 尚未回答');
  await expect(day.getByRole('list', { name: 'Day 7 验收反馈' })).toContainText('缺少“明确决策”');
  await expect(day.getByRole('list', { name: 'Day 7 验收反馈' })).toContainText('缺少“被否决方案”');

  await day.getByLabel('问题 1 的回答').fill('结论为 go/no-go 中的 go：质量达到阈值；recall@10 与 groundedness 达标，失败分类中权限问题已归零；P95 180ms 且单位 query 成本 0.02 元。');
  await day.getByLabel('问题 2 的回答').fill('事实缺失且可检索时选 RAG；表达与格式问题先用 Prompt；稳定行为缺口才评估 SFT；模型能力边界不足且收益覆盖迁移成本时换模型。');
  await day.getByLabel('问题 3 的回答').fill('最大瓶颈是长 query 的排序错误。下一项实验只改变 reranker 这一唯一变量，控制项为固定 query、索引和 prompt，成功阈值是 MRR 提升 5%，停止条件是 P95 超过 220ms。');
  await day.getByLabel('产出证据摘要').fill('ADR-007 固定样本量 100、corpus-v3/model-v2 版本与统计口径；决策表包含质量、失败分类、P95 和成本。否决方案为 query rewrite，因收益 1% 但成本增加 30%；下一项实验卡写明唯一变量、控制项、阈值和停止条件。');
  await day.getByRole('button', { name: '提交 Day 7 验收' }).click({ force: true });

  await expect(day).toContainText('已通过');
  await expect(day.getByText('Day 7 已通过确定性完整性检查')).toBeVisible();
  await expect(page.getByText('1 / 14 天通过', { exact: true })).toBeVisible();
});
