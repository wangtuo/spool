const { test, expect } = require('./fixtures');

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
  await page.goto("/", { waitUntil: "domcontentloaded" });
});

test('supplemental directory is discoverable, searchable, filterable, and opens safe external links', async ({ page }) => {
  const directory = page.locator('#directory');
  await expect(directory).toContainText('按需拓展，不计入 14 天必学任务');
  await directory.getByRole('searchbox', { name: '搜索补充资源' }).fill('vLLM');
  await expect(directory.getByRole('status')).toHaveText('显示 1 / 56 条补充资源');
  await expect(directory.getByRole('article')).toContainText('vLLM');

  await directory.getByRole('searchbox').fill('');
  await directory.getByRole('button', { name: '安全', exact: true }).click();
  await expect(directory.getByRole('button', { name: '安全', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(directory.getByRole('status')).toContainText(/显示 \d+ \/ 56 条补充资源/);
  const external = directory.getByRole('link', { name: /新窗口/ }).first();
  await expect(external).toHaveAttribute('target', '_blank');
  await expect(external).toHaveAttribute('rel', /noopener/);
  await expect(external).toHaveAttribute('rel', /noreferrer/);
});

test('resource dialog has a visible accessible name, stable unit IDs, and returns focus', async ({ page }) => {
  const trigger = page.getByRole('button', { name: '查看 3Blue1Brown 的补充学习内容' });
  await trigger.focus();
  await trigger.press('Enter');

  const dialog = page.getByRole('dialog', { name: '3Blue1Brown' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('可选拓展，不计入 14 天通过进度');
  await expect(page.locator('[data-unit-id="creator-3blue1brown-unit-1"]')).toBeVisible();
  await expect(page.locator('[data-link-id="creator-3blue1brown-unit-1-link-1"]')).toHaveAttribute('href', 'https://www.youtube.com/@3blue1brown');
  await expect(page.getByRole('button', { name: '关闭资源详情' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('review actions and live feedback expose the current state', async ({ page }) => {
  const day = page.getByRole('article', { name: /DAY 01/ });
  await expect(day).toContainText('每日核心材料与阅读范围');
  await expect(day).toContainText('补充资源目录不计入通过要求');
  await day.getByLabel('问题 1 的回答').fill('只有一个非常简略且无法验收的回答。');
  await day.getByRole('button', { name: '提交 Day 1 验收' }).press('Enter');
  await expect(day.getByRole('alert')).toBeFocused();
  await expect(day.getByRole('button', { name: '补充后重新提交 Day 1 验收' })).toBeVisible();
  await expect(day.getByRole('status')).toHaveText('需补充');
});

test('reset cancellation preserves progress and confirmation clears it with focus return', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('llm-learning-progress', JSON.stringify({
    version: 2,
    days: { 'day-01': { status: 'passed', answers: ['a', 'b', 'c'], evidence: 'evidence', declaration: true, feedback: [] } }
  })));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByText('1 / 14 天通过', { exact: true })).toBeVisible();

  const reset = page.getByRole('button', { name: '重置进度' });
  await reset.press('Enter');
  const dialog = page.getByRole('dialog', { name: '重置全部学习进度？' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '取消，保留进度' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(reset).toBeFocused();
  await expect(page.getByText('1 / 14 天通过', { exact: true })).toBeVisible();

  await reset.press('Enter');
  await dialog.getByRole('button', { name: '确认重置' }).press('Enter');
  await expect(page.getByText('0 / 14 天通过', { exact: true })).toBeVisible();
  await expect(reset).toBeFocused();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('llm-learning-progress')))).toEqual({ version: 2, days: {} });
});

test('normal text meets AA contrast and reduced-motion preference suppresses transitions', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: "domcontentloaded" });
  const checks = await page.locator('.hero-desc, .section-note, .directory-org, .directory-card p, .result-count').evaluateAll(elements => {
    const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = color => {
      const values = rgb(color).map(value => {
        const channel = value / 255;
        return channel <= .03928 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      });
      return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
    };
    const opaqueBackground = element => {
      let node = element;
      while (node) {
        const color = getComputedStyle(node).backgroundColor;
        if (color && !color.endsWith(', 0)')) return color;
        node = node.parentElement;
      }
      return 'rgb(255, 255, 255)';
    };
    return elements.map(element => {
      const foreground = luminance(getComputedStyle(element).color);
      const background = luminance(opaqueBackground(element));
      return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
    });
  });
  expect(Math.min(...checks)).toBeGreaterThanOrEqual(4.5);
  expect(await page.locator('.resource-card').first().evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThanOrEqual(.00001);
  await context.close();
});
