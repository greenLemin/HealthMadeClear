import { expect, test, waitForAppReady } from "./setup";

test("signup form renders required fields", async ({ page }) => {
  await page.goto("/en/auth/signup");
  await waitForAppReady(page);

  await expect(page.getByRole("heading", { level: 1, name: /create your free account/i })).toBeVisible();
  await expect(page.getByLabel(/display name/i)).toBeVisible();
  await expect(page.getByLabel(/email address/i)).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
});

test("forgot-password form submits and shows confirmation", async ({ page }) => {
  await page.goto("/en/auth/forgot-password");
  await waitForAppReady(page);

  await expect(page.getByRole("heading", { level: 1, name: /reset your password/i })).toBeVisible();
  await page.getByLabel(/email address/i).fill("guest@example.com");
  await page.getByRole("button", { name: /send reset link/i }).click();

  await expect(page.getByRole("heading", { level: 1, name: /check your email/i })).toBeVisible();
  await expect(page.getByRole("status")).toBeVisible();
});
