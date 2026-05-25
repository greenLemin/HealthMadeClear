import { expect, test } from "@playwright/test";

test("home loads and navigates to learn library", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator('header a[href="/learn"]').click();
  await expect(page).toHaveURL(/\/learn$/);
});

test("language preference persists in localStorage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ES" }).click();
  await page.reload();
  const locale = await page.evaluate(() => window.localStorage.getItem("hmc-locale"));
  expect(locale).toBe("es");
});

test("glossary hash navigation", async ({ page }) => {
  await page.goto("/glossary#hypertension");
  await expect(page.locator("#hypertension")).toBeVisible();
});
