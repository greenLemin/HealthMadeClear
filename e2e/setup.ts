import { test as base, expect, type Page } from "@playwright/test";

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator('html[data-hydrated="true"]').waitFor({ state: "attached" });
  await page.locator("header").waitFor({ state: "visible" });
}

export async function signInMockUser(page: Page, redirectPath = "/dashboard") {
  const escapedRedirect = redirectPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expectedUrl =
    redirectPath === "/" ? /\/en(?:\/)?(?:\?|$)/ : new RegExp(`\\/en${escapedRedirect}(?:\\?|$)`);
  const encodedRedirect = encodeURIComponent(redirectPath);
  await page.goto(`/en/auth/login?redirect=${encodedRedirect}`);
  await waitForAppReady(page);
  await page.getByLabel(/email address/i).fill("guest@example.com");
  await page.locator('input[type="password"]').fill("password123");
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
