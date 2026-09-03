import { test as base, expect, type Page } from "@playwright/test";

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState("load");
  await page.locator("header").waitFor({ state: "visible", timeout: 20_000 });
  await page
    .locator('html[data-hydrated="true"]')
    .waitFor({ state: "attached", timeout: 20_000 })
    .catch(() => undefined);
}

function getMockPassword(): string {
  const pwd =
    process.env.NEXT_PUBLIC_MOCK_GUEST_PASSWORD ||
    process.env.MOCK_GUEST_PASSWORD ||
    process.env.MOCK_USER_PASSWORD;
  if (!pwd) return "password123";
  return pwd;
}

export async function signInMockUser(page: Page, redirectPath = "/dashboard") {
  const escapedRedirect = redirectPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expectedUrl =
    redirectPath === "/" ? /\/en(?:\/)?(?:\?|$)/ : new RegExp(`\\/en${escapedRedirect}(?:\\?|$)`);
  const encodedRedirect = encodeURIComponent(redirectPath);
  await page.goto(`/en/auth/login?redirect=${encodedRedirect}`);
  await waitForAppReady(page);
  await page.getByLabel(/email address/i).fill("guest@example.com");
  await page.locator('input[type="password"]').fill(getMockPassword());
  await Promise.all([
    page.waitForURL(expectedUrl, { timeout: 15000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("hmc_onboarded", "true");
    });
    await use(page);
  },
});

export { expect };
