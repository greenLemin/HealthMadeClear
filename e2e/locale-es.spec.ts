import { expect, test, waitForAppReady } from "./setup";

test.describe("Spanish locale smoke", () => {
  test("home loads with Spanish heading", async ({ page }) => {
    await page.goto("/es");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/entiende tu salud/i);
  });

  test("learn page loads", async ({ page }) => {
    await page.goto("/es/learn");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/qué te gustaría aprender/i);
  });

  test("glossary page loads", async ({ page }) => {
    await page.goto("/es/glossary");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/glosario de salud/i);
  });

  test("header learn link navigates in Spanish", async ({ page }) => {
    await page.goto("/es");
    await waitForAppReady(page);
    await page.locator('header a[href="/es/learn"]').first().click();
    await expect(page).toHaveURL(/\/es\/learn$/);
  });
});
