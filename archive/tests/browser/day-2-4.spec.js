const { test, expect } = require('./fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

const submissions = [
  {
    number: 2,
    budget: ['输入 25 分钟', '实践 55 分钟', '记录与验收 25 分钟'],
    answers: [
      'Embedding 的收益是低成本向量召回，Reranker 的收益是对候选精排，生成模型负责生成答案；三者代价和延迟不同，约束包括候选集与上下文，生产中不能用一个生成模型替代全部职责。',
      'token 数受 tokenizer 和模型版本影响，直接占用上下文，API 按 token 计费用，输入越长 prefill 延迟通常越高；硬件、batch 和计费口径都会约束结论。',
      'Q、K、V shape 都是 batch×head×n×d，score 是 n×n，causal mask 屏蔽未来；n 翻倍时标准 prefill attention 为 O(n²)，decode 的 KV Cache 容量随 token 近似线性增长。'
    ],
    evidence: 'model-boundary.md 记录生成、Embedding、Reranker 的收益代价约束；token-stats.csv 含 20 条样本和 tokenizer 版本；attention_shapes.py 有 Q/K/V shape、mask 断言，mechanism-note.md 有 n=4/8 的 O(n²) 手算与 KV Cache 线性估算。'
  },
  {
    number: 3,
    budget: ['输入 20 分钟', '实践 65 分钟', '记录与验收 25 分钟'],
    answers: [
      '训练用 teacher forcing 并行算 loss、保存激活和梯度；推理逐 token 生成且用 KV Cache 复用历史计算，代价分别是训练显存与推理串行延迟。',
      'causal mask 阻止当前位置读取未来 token；脚本记录 QK score shape，并用断言检查上三角未来权重为零，故障注入移除 mask 后断言失败。',
      '先过拟合一个 batch 验证闭环；loss 不降依次检查数据、target 错位、梯度、学习率。最小实现缺少生产所需批处理、数值稳定和监控，收益是诊断清楚，约束是不适合生产流量。'
    ],
    evidence: 'minimal_transformer.py 固定 seed 并含 shape 断言；run-log.md 记录 batch、target、学习率、100 step 起止 loss、梯度与 tokens/s，附生成样例、causal mask 故障和修复，以及生产约束。'
  },
  {
    number: 4,
    budget: ['输入 25 分钟', '实践 55 分钟', '记录与验收 25 分钟'],
    answers: [
      '清洗提高可解析性，去重减少重复成本，metadata 支持过滤，版本支持复现，血缘支持追溯；收益对应质量和审计，代价是存储与运维，约束是处理规则必须版本化。',
      '固定字符会切断语义；应在语义完整与召回粒度间取舍，同时控制上下文 token 成本，并保留 source offset 供追溯。',
      'ACL 缺失时发布门禁拒绝，检索时再按调用者 ACL 强制过滤；审计日志记录身份与版本，索引别名可回滚上一 manifest。'
    ],
    evidence: '数据脚本重复运行两次 manifest hash 和 chunk 数一致；质量报告含分母；10 条抽检均能按 metadata、版本和血缘追溯；无 ACL 样本被门禁拒绝，ADR 记录过滤、审计和回滚。'
  }
];

test('learner reviews, corrects and passes Days 2–4 with persisted progress', async ({ page }) => {
  for (const submission of submissions) {
    let day = page.getByRole('article', { name: new RegExp(`DAY 0${submission.number}`) });

    await expect(day).toContainText(`ID: day-0${submission.number}`);
    for (const budget of submission.budget) await expect(day).toContainText(budget);
    await expect(day.getByRole('link').first()).toHaveAttribute('rel', /noopener/);
    await expect(day.getByText(/判断依据：/)).toBeHidden();

    await day.getByLabel(/我确认已完成/).check({ force: true });
    await day.getByRole('button', { name: `提交 Day ${submission.number} 验收` }).click({ force: true });
    await expect(day).toContainText('需补充');
    await expect(day.getByRole('list', { name: `Day ${submission.number} 验收反馈` })).toContainText('问题 1 尚未回答');

    day = page.getByRole('article', { name: new RegExp(`DAY 0${submission.number}`) });
    for (let index = 0; index < submission.answers.length; index += 1) {
      await day.getByLabel(`问题 ${index + 1} 的回答`).fill(submission.answers[index]);
    }
    await day.getByLabel('产出证据摘要').fill(submission.evidence);
    await day.getByRole('button', { name: `提交 Day ${submission.number} 验收` }).click({ force: true });
    await expect(day).toContainText('已通过');
    await expect(day.getByText(`Day ${submission.number} 已通过确定性完整性检查`)).toBeVisible();
  }

  await expect(page.getByText('3 / 14 天通过', { exact: true })).toBeVisible();
  await expect(page.getByText('21%', { exact: true })).toBeVisible();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  for (const submission of submissions) {
    const restored = page.getByRole('article', { name: new RegExp(`DAY 0${submission.number}`) });
    await expect(restored).toContainText('已通过');
    await expect(restored.getByLabel('产出证据摘要')).toHaveValue(submission.evidence);
  }
  await expect(page.getByText('3 / 14 天通过', { exact: true })).toBeVisible();
});

test('Day 2–4 content exposes scoped first-party learning and auditable outcomes', async ({ page }) => {
  const expectations = [
    [2, '模型边界与 Transformer 机制', 'token-stats.csv', '生产边界'],
    [3, '最小实现验证', 'minimal_transformer.py', '故障注入'],
    [4, '可追溯数据资产', 'versioned manifest', '无 ACL 样本']
  ];

  for (const [number, topic, output, criterion] of expectations) {
    const day = page.getByRole('article', { name: new RegExp(`DAY 0${number}`) });
    await expect(day).toContainText(topic);
    await expect(day).toContainText('精简权威材料与阅读范围');
    await expect(day).toContainText(output);
    await expect(day).toContainText(criterion);
    await expect(day.getByRole('textbox')).toHaveCount(4);
  }
});
