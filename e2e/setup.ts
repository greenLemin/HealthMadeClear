import { test as base, expect, type Page } from "@playwright/test";

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.locator("header").waitFor({ state: "visible" });
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
