import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

function getMockGuestPassword(): string {
  return process.env.NEXT_PUBLIC_MOCK_GUEST_PASSWORD || process.env.MOCK_GUEST_PASSWORD || "password123";
}

function allowlistedEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined) continue;
    if (k.startsWith("NEXT_PUBLIC_") || k.startsWith("MOCK_")) out[k] = v;
  }
  return out;
}

export default defineConfig({
  testDir: "./e2e",
  testIgnore: isCI ? ["**/visual.spec.ts"] : [],
  fullyParallel: !isCI,
  forbidOnly: isCI,
  retries: 2,
  // workers undefined lets Playwright choose optimal per machine; previously workers:1 serialized browsers
  timeout: isCI ? 60_000 : 30_000,
  expect: {
    timeout: isCI ? 15_000 : 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    actionTimeout: isCI ? 20_000 : 10_000,
    trace: "on-first-retry",
    viewport: { width: 1600, height: 900 },
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
        env: {
          ...allowlistedEnv(),
          NEXT_PUBLIC_MOCK_GUEST_PASSWORD: getMockGuestPassword(),
        },
        command: "npm run build && npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !isCI,
        timeout: isCI ? 180_000 : 60_000,
      }
    : {
        env: {
          ...allowlistedEnv(),
          NEXT_PUBLIC_MOCK_GUEST_PASSWORD: getMockGuestPassword(),
        },
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !isCI,
        timeout: isCI ? 180_000 : 60_000,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 900 } } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1600, height: 900 } } },
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1600, height: 900 } } },
  ],
});
