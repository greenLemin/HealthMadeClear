import { expect, test } from "@playwright/test";

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
