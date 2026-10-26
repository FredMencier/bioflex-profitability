import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3100/bioflex-profitability/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "PLAYWRIGHT_TEST=true pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/bioflex-profitability/",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
