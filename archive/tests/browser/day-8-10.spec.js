const { test, expect } = require('./fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole('button', { name: '第 2 周' }).click({ force: true });
});

function dayArticle(page, number) {
  return page.getByRole('article', { name: new RegExp(`DAY ${String(number).padStart(2, '0')}`) });
}

async function submitDay(day, answers, evidence) {
  for (let index = 0; index < answers.length; index += 1) {
    await day.getByLabel(`问题 ${index + 1} 的回答`).fill(answers[index]);
  }
  await day.getByLabel('benchmark 证据摘要').fill(evidence);
  await day.getByLabel(/我确认已完成/).check({ force: true });
  await day.getByRole('button', { name: /提交 Day [0-9]+ 验收/ }).click({ force: true });
}

test('Day 8–10 expose bounded, evidence-led learning paths', async ({ page }) => {
  const day8 = dayArticle(page, 8);
  const day9 = dayArticle(page, 9);
  const day10 = dayArticle(page, 10);

  await expect(day8.locator('.budget-row')).toHaveAttribute('aria-label', '时间预算，共 100 分钟');
  await expect(day8).toContainText('至少 30 个成功请求');
  await expect(day8).toContainText('延伸到 100 个以上');
  await expect(day8).toContainText('TTFT、TPOT、E2E');
  await expect(day8).toContainText('prefill→首 token→decode');
  await expect(day8).toContainText('P50/P95/P99');

  await expect(day9.locator('.budget-row')).toHaveAttribute('aria-label', '时间预算，共 105 分钟');
  await expect(day9).toContainText('KV Cache');
  await expect(day9).toContainText('continuous batching');
  await expect(day9).toContainText('计算、显存带宽、调度或排队');
  await expect(day9).toContainText('背压');
  await expect(day9).toContainText('多租户公平性');

  await expect(day10.locator('.budget-row')).toHaveAttribute('aria-label', '时间预算，共 110 分钟');
  await expect(day10).toContainText('后端支持矩阵');
  await expect(day10).toContainText('质量、显存、吞吐、P95、成本');
  await expect(day10).toContainText('流式/超时/取消/限流/幂等/fallback');
  await expect(day10).toContainText('不得写成“INT4 一定更快”');

  for (const day of [day8, day9, day10]) {
    const links = day.locator('.material-list a');
    await expect(links).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(links.nth(index)).toHaveAttribute('target', '_blank');
      await expect(links.nth(index)).toHaveAttribute('rel', /noreferrer/);
    }
    await expect(day.getByText(/判断依据：|TTFT 包含|近似 KV bytes|量化减少权重/)).toBeHidden();
  }
});

test('benchmark review rejects missing context, then persists three passed days', async ({ page }) => {
  let day8 = dayArticle(page, 8);
  await submitDay(day8, [
    'TTFT 是首 token 时间，TPOT 是 token 间隔，E2E 是完整响应时间。',
    'P95 高时检查请求长度、排队时间、冷路径与热路径。',
    '这只是一次局部 benchmark，不能推广到任何其他环境。'
  ], '跑了测试，结果不错，P95 是 500ms。');

  await expect(day8).toContainText('需补充');
  const feedback = day8.getByRole('list', { name: 'Day 8 验收反馈' });
  await expect(feedback).toContainText('证据摘要缺少模型与 revision');
  await expect(feedback).toContainText('证据摘要缺少硬件与驱动');
  await expect(feedback).toContainText('证据摘要缺少样本量');
  await expect(feedback).toContainText('缺少“prefill、decode 与排队”');
  await expect(page.getByText('0 / 14 天通过', { exact: true })).toBeVisible();

  day8 = dayArticle(page, 8);
  await submitDay(day8, [
    'TTFT 从请求到首 token，包含排队与 prefill；TPOT 衡量首 token 后 decode 的 token 间隔；E2E 到完整响应。',
    'P95 高而均值正常时，按输入输出长度、并发、排队、冷路径和热路径分层定位尾延迟。',
    '结果仅适用本模型、GPU、runtime、量化格式与负载，变化后不能推广，必须重新实验。'
  ], '模型 Qwen-test revision abc；硬件 GPU A100 80GB、驱动 550；runtime vLLM、版本 0.x；量化格式 BF16；输入 P50/P95 128/512 token，输出 P50/P95 64/128 token；并发 8；warm-up 10；样本量 120 个成功请求、2 个超时计入失败；P50/P95/P99 用 nearest-rank；TTFT 100/220/300ms，TPOT 10/18/25ms，E2E 1/2/3s，排队 P95 40ms，吞吐 500 token/s；原始数据 bench.json；结论边界仅适用当前配置。');
  await expect(day8).toContainText('Day 8 已通过确定性完整性检查');

  const day9 = dayArticle(page, 9);
  await submitDay(day9, [
    'KV Cache 由层数、KV heads、head_dim、K/V 两份、dtype bytes、序列长度和并发决定，GQA/MQA 减少 KV heads。',
    'continuous batching 在 decode 迭代边界调度新请求，提高利用率但排队和抢占会增加 TTFT 与尾延迟。',
    'admission control 控制接纳，配额保障公平调度，队列上限触发背压，按租户观测 P95 和拒绝率。'
  ], '引用 Day 8；模型 Qwen-test revision abc；硬件 GPU A100 80GB、驱动 550；runtime vLLM、版本 0.x；量化格式 BF16；KV dtype FP16/block 16；输入 P50/P95 128/2048，输出 P50/P95 64/128；并发 16；样本量 100；P95 nearest-rank。KV Cache 公式与实测记录齐全；continuous batching trace 含 running/waiting/preemption/rejection。profiler 将瓶颈区分为计算、显存带宽、调度、排队；租户 A/B 报告 P95、吞吐和拒绝率，队列实施背压与公平配额；结论边界仅适用本负载。');
  await expect(day9).toContainText('Day 9 已通过确定性完整性检查');

  const day10 = dayArticle(page, 10);
  await submitDay(day10, [
    '相同位宽受模型、GPU、runtime、kernel、反量化、batch 和 KV Cache 影响，吞吐或 P95 不一定改善。',
    '固定 golden set、任务、解码参数和预注册质量阈值，结合平均指标与失败样例决定是否接受。',
    '流式由网关转发；超时传播 deadline，取消停止后端生成，限流负责背压；幂等约束重试，fallback 受质量成本边界控制。'
  ], '模型 Qwen-test revision abc；硬件 GPU A100 80GB、驱动 550；runtime vLLM 0.x 与 kernel 版本；量化格式基线 BF16 对 AWQ W4A16，支持矩阵已确认；输入 P50/P95 128/512，输出 P50/P95 64/128；并发 8；样本量各 100；P95 nearest-rank。golden set 50 条、质量阈值退化不超 1%，记录失败样例；显存 28→18GB、吞吐 500→620 token/s、P95 2→1.8s、成本按 GPU 秒核算。流式、超时、取消、限流、幂等与 fallback 已测试；回滚门槛已记录；不能推广，结论边界仅适用当前环境。');
  await expect(day10).toContainText('Day 10 已通过确定性完整性检查');
  await expect(page.getByText('3 / 14 天通过', { exact: true })).toBeVisible();
  await expect(page.getByText('21%', { exact: true })).toBeVisible();

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole('button', { name: '第 2 周' }).click({ force: true });
  for (const number of [8, 9, 10]) {
    await expect(dayArticle(page, number)).toContainText('已通过');
  }
  await expect(dayArticle(page, 10).getByLabel('benchmark 证据摘要')).toHaveValue(/AWQ W4A16/);
  await expect(page.getByText('3 / 14 天通过', { exact: true })).toBeVisible();
});
