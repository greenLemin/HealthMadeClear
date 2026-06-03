import { expect, test } from "@playwright/test";

test("lesson detail and mark complete", async ({ page }) => {
  await page.goto("/en/learn/understanding-prescription-labels");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/prescription/i);
  await page.getByRole("button", { name: /mark as complete/i }).click();
  await page.goto("/en/dashboard");
  await expect(page.getByText(/1 \/ /)).toBeVisible();
});

test("visit checklist persists after reload", async ({ page }) => {
  await page.goto("/en/tools/visit-checklist");
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();
  await page.reload();
  await expect(page.locator('input[type="checkbox"]').first()).toBeChecked();
});

test("dark mode toggle updates document dataset", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /display/i }).click();
  await page.getByRole("radio", { name: /dark/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("simple mode toggle", async ({ page }) => {
  await page.goto("/en");
  await page.getByRole("button", { name: /display/i }).click();
  await page.getByRole("button", { name: /^off$/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-simple-mode", "true");
});

test("glossary term page loads", async ({ page }) => {
  await page.goto("/en/glossary/hypertension");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("progress export button exists on dashboard", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page.getByRole("button", { name: /export progress/i })).toBeVisible();
});
