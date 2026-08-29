import os from "node:os";
import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

function shouldRunFirefox(): boolean {
  if (process.env.PLAYWRIGHT_FIREFOX === "1") return true;
  if (process.env.PLAYWRIGHT_SKIP_FIREFOX === "1") return false;
  if (isCI) return true;
  // macOS 27: Firefox CLI launch hangs (plugin-container sandbox). Playwright #42082.
  const darwinMajor = Number.parseInt(os.release().split(".")[0] ?? "0", 10);
  if (process.platform === "darwin" && darwinMajor >= 27) return false;
  return true;
}

function getMockGuestPassword(): string {
  return process.env.NEXT_PUBLIC_MOCK_GUEST_PASSWORD || process.env.MOCK_GUEST_PASSWORD || "password123";
}

function e2eWebServerEnv(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v === undefined) continue;
    out[k] = v;
  }
  // Force the in-process placeholders so `next dev` does not treat empty strings
  // as unset and reload .env.local (real project keys). Mock client is development
  // + !isSupabaseConfigured(). next.config.mjs must not bridge a real SUPABASE_URL.
  out.NEXT_PUBLIC_SUPABASE_URL = "https://placeholder.supabase.co";
  out.NEXT_PUBLIC_SUPABASE_ANON_KEY = "placeholder_anon_key";
  out.SUPABASE_URL = "https://placeholder.supabase.co";
  out.SUPABASE_ANON_KEY = "placeholder_anon_key";
  out.SUPABASE_DATABASE_URL = "https://placeholder.supabase.co";
  out.NEXT_PUBLIC_MOCK_GUEST_PASSWORD = getMockGuestPassword();
  return out;
}

export default defineConfig({
  testDir: "./e2e",
  testIgnore: [
    ...(isCI ? ["**/visual.spec.ts"] : []),
    // Live Netlify crawl does not exercise this checkout. Opt in with AUDIT_LIVE=1 after deploy.
    ...(!process.env.AUDIT_LIVE ? ["**/audit.spec.ts"] : []),
  ],
  fullyParallel: false,
  forbidOnly: isCI,
  retries: 2,
  // next dev 500s under parallel compile (JSON.parse of concatenated RSC payloads).
  workers: isCI ? undefined : 1,
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
        env: e2eWebServerEnv(),
        command: "npm run build && npm run start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: false,
        timeout: isCI ? 180_000 : 60_000,
      }
    : {
        env: e2eWebServerEnv(),
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: false,
        timeout: isCI ? 180_000 : 60_000,
      },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 900 } } },
    ...(shouldRunFirefox()
      ? [{ name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1600, height: 900 } } }]
      : []),
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1600, height: 900 } } },
  ],
});
