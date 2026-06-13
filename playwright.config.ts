import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: isCI ? ["**/visual.spec.ts"] : [],
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: isCI ? 60_000 : 30_000,
  expect: {
    timeout: isCI ? 15_000 : 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    actionTimeout: isCI ? 20_000 : 10_000,
    trace: "on-first-retry",
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://127.0.0.1:3000",
          localStorage: [{ name: "hmc_onboarded", value: "true" }],
        },
      ],
    },
  },
  webServer: process.env.PLAYWRIGHT_PROD
    ? {
        command: "npm run build && npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
      }
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !isCI,
        timeout: isCI ? 180_000 : 60_000,
      },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
