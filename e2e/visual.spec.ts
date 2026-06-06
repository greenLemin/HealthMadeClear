import { expect, test } from "@playwright/test";

// Visual snapshot tests require a Linux baseline (CI runs on Ubuntu). The
// committed darwin snapshots do not match Linux-rendered output because
// font metrics, anti-aliasing, and DPR differ between platforms. To
// re-enable in CI: run `npx playwright test e2e/visual.spec.ts
// --update-snapshots` on a Linux runner, commit the linux baseline, then
// remove the skip.
test.skip(!!process.env.CI, "Visual baseline only matches local platform");

test("home visual baseline light", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveScreenshot("home-en-light.png", { fullPage: true });
});

test("home visual baseline dark", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /display/i }).click();
  await page.getByRole("radio", { name: /dark/i }).click();
  await expect(page).toHaveScreenshot("home-en-dark.png", { fullPage: true });
});
