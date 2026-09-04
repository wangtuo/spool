const base = require("@playwright/test");

const test = base.test.extend({
  page: async ({ page }, use) => {
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "127.0.0.1" || url.hostname === "localhost")
        await route.continue();
      else await route.abort();
    });
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const style = document.createElement("style");
        style.dataset.playwrightDeterministicMotion = "true";
        style.textContent = `
          html { scroll-behavior: auto !important; }
          *, *::before, *::after {
            animation: none !important;
            caret-color: transparent !important;
            scroll-behavior: auto !important;
            transition: none !important;
          }
        `;
        document.head.append(style);
      }, { once: true });
    });
    await use(page);
  },
});

module.exports = { test, expect: base.expect };
