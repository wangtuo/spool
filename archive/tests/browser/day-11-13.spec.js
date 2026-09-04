const { test, expect } = require('./fixtures');

const submissions = {
  11: {
    weak: ['自动评测可以打分。', 'trace 要注意隐私。', '采样可以省钱。'],
    weakEvidence: '有一份评测报告，但还没有记录样本量。',
    feedback: ['缺少样本量证据', '缺少人工校准证据'],
    answers: [
      '自动评测可能有 judge 偏差，必须和人工评分对照并报告差异与归因，不能替代人工验收。',
      'trace 对 PII 正文做脱敏，对用户身份做哈希并删除密钥，同时记录规则和阈值。',
      '正常请求按采样率抽取，错误和慢请求优先保留，并限制高基数标签和保留期。'
    ],
    evidence: 'eval-v3 固定 100 条样本；按固定抽样方法完成 20 条人工抽检。自动与人工差异表记录分歧归因，指标规则和阈值在 metrics.md。trace schema 记录脱敏、采样率和保留期。'
  },
  12: {
    weak: ['做了一些攻击。', '工具要校验权限。', '成本按请求计算。'],
    weakEvidence: '安全测试已完成，但没有附攻击分类。',
    feedback: ['攻击证据不完整', '缺少权限证据', '缺少残余风险或风险余量'],
    answers: [
      'prompt injection 是内容操纵；越权检索是身份或 ACL 授权绕过，两者要用不同控制与审计证据。',
      '工具使用调用者身份和最小权限，逐跳传递 ACL，服务端校验权限，并审批高风险副作用。',
      '成本按 QPS、输入 token、输出 token、检索和 GPU 单价重算，并纳入峰值与容量余量。'
    ],
    evidence: 'attack-log.md 分别记录 prompt injection、越权检索、数据泄露、工具滥用的 trace。权限图含身份、tenant 和 ACL；控制表含拦截结果、误报、残余风险与风险余量。成本公式使用 QPS、输入和输出分布。'
  },
  13: {
    weak: ['控制面管配置。', 'RPO 和 RTO 要定义。', '失败后重试。'],
    weakEvidence: '画了架构图，故障后做了重试。',
    feedback: ['缺少配额、公平性或 backpressure 依据', '缺少恢复依据', '缺少故障期间的容量风险余量'],
    answers: [
      '控制面负责配置发布与治理，数据面承载请求；按区域和依赖标出故障域及隔离边界。',
      'RPO 是可接受数据丢失，RTO 是恢复时长，active-passive 切换后用时间线和数据核对验证。',
      '消息用幂等键与去重表保护副作用；过载先 backpressure，再按业务语义 fallback 而非盲目重试。'
    ],
    evidence: '演练记录含注入时间、告警时间、切换与恢复时间和数据核对。架构图含控制面、数据面、故障域、租户配额、公平调度、backpressure、fallback、幂等键及容量余量；RPO/RTO 表记录是否达标。'
  }
};

async function openWeekTwo(page) {
  await page.getByRole('button', { name: '第 2 周' }).click({ force: true });
}

async function fillSubmission(day, number, submission) {
  for (let index = 0; index < submission.answers.length; index += 1) {
    await day.getByLabel('Day ' + number + ' 问题 ' + (index + 1) + ' 的回答').fill(submission.answers[index]);
  }
  await day.getByLabel('Day ' + number + ' 产出证据摘要').fill(submission.evidence);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openWeekTwo(page);
});

test('learner and architect reviewer reject, correct, and persist Days 11–13', async ({ page }) => {
  for (const number of [11, 12, 13]) {
    const submission = submissions[number];
    let day = page.getByRole('article', { name: new RegExp('DAY ' + number) });

    await fillSubmission(day, number, { answers: submission.weak, evidence: submission.weakEvidence });
    await day.getByLabel(/我确认已完成/).check({ force: true });
    await day.getByRole('button', { name: '提交 Day ' + number + ' 验收' }).click({ force: true });

    await expect(day).toContainText('需补充');
    const feedback = day.getByRole('list', { name: 'Day ' + number + ' 验收反馈' });
    for (const message of submission.feedback) await expect(feedback).toContainText(message);

    await fillSubmission(day, number, submission);
    await day.getByRole('button', { name: '提交 Day ' + number + ' 验收' }).click({ force: true });
    await expect(day).toContainText('已通过');
    await expect(day.getByText('Day ' + number + ' 已通过确定性完整性检查')).toBeVisible();
  }

  await expect(page.getByText('3 / 14 天通过', { exact: true })).toBeVisible();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await openWeekTwo(page);

  for (const number of [11, 12, 13]) {
    const day = page.getByRole('article', { name: new RegExp('DAY ' + number) });
    await expect(day).toContainText('已通过');
    await expect(day.getByLabel('Day ' + number + ' 产出证据摘要')).toHaveValue(submissions[number].evidence);
  }
  await expect(page.getByText('3 / 14 天通过', { exact: true })).toBeVisible();
});

test('architect can verify budgets, core evidence requirements, and scoped extensions', async ({ page }) => {
  const expectations = [
    [11, '共 100 分钟', ['固定 100 条', '至少 20 条人工抽检', 'trace', '脱敏', '采样率']],
    [12, '共 110 分钟', ['prompt injection', '越权检索', '数据泄露', '工具滥用', '误报', '残余风险', '风险余量', 'QPS']],
    [13, '共 100 分钟', ['控制面', '数据面', '故障域', '配额', '公平', 'backpressure', 'fallback', '幂等', 'RPO/RTO', '恢复证据']]
  ];

  for (const [number, budget, terms] of expectations) {
    const day = page.getByRole('article', { name: new RegExp('DAY ' + number) });
    await expect(day.getByLabel(new RegExp(budget))).toBeVisible();
    for (const term of terms) await expect(day).toContainText(term, { ignoreCase: true });
    await expect(day).toContainText(/延伸（不计入 \d+ 分钟）/);
    const links = day.locator('a');
    await expect(links.first()).toHaveAttribute('target', '_blank');
    await expect(links.first()).toHaveAttribute('rel', /noopener/);
  }
});
