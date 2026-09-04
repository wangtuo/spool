const { defineConfig } = require("@playwright/test");
const port = 4176;

module.exports = defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  reporter: "line",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "off",
    launchOptions: {
      args: ["--disable-gpu", "--disable-gpu-compositing"],
    },
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1`,
    url: `http://127.0.0.1:${port}`,
    stdout: "ignore",
    stderr: "ignore",
    reuseExistingServer: true,
  },
});
