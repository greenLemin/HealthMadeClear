import { expect, signInMockUser, test, waitForAppReady } from "./setup";

test.describe("authenticated dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await signInMockUser(page);
    await expect(page).toHaveURL(/\/en\/dashboard(?:\?|$)/);
  });

  test("dashboard overview loads", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: /welcome back|welcome to healthmadeclear/i })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /export progress/i })).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/en/dashboard/settings");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { level: 1, name: /settings/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel(/display name/i)).toBeVisible();
  });

  test("achievements page loads", async ({ page }) => {
    await page.goto("/en/dashboard/achievements");
    await waitForAppReady(page);
    await expect(page.getByRole("heading", { level: 1, name: /achievements/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
