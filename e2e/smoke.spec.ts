import { expect, test } from "./setup";

test("home loads and navigates to learn library", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator('header a[href="/en/learn"]').click();
  await expect(page).toHaveURL(/\/en\/learn$/);
});

test("language preference persists in localStorage and URL", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("radio", { name: /spanish/i }).click();
  await expect(page).toHaveURL(/\/es(\/|$)/);
  await page.reload();
  const locale = await page.evaluate(() => window.localStorage.getItem("hmc-locale"));
  expect(locale).toBe("es");
  await expect(page).toHaveURL(/\/es(\/|$)/);
});

test("glossary hash navigation", async ({ page }) => {
  await page.goto("/en/glossary#hypertension");
  await expect(page.locator("#hypertension")).toBeVisible();
});

test("root redirects to default locale", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en(\/|$)/);
});
