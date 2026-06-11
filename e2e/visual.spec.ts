import { expect, test } from "./setup";

// CI uses Linux baselines (home-en-*-chromium-linux.png). Local macOS runs use darwin snapshots.
test.skip(
  !process.env.CI && process.platform === "darwin",
  "Local macOS uses darwin snapshots; run visual tests in CI or update darwin baselines locally"
);

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
