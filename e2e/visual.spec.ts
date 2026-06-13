import { expect, test } from "./setup";

// Full-page visual baselines are OS-specific. Run locally on Linux (or Docker) to refresh:
//   docker run --rm -v "$PWD":/work -w /work -e CI=true mcr.microsoft.com/playwright:v1.60.0-noble \
//     bash -c "npm ci && npx playwright test e2e/visual.spec.ts --update-snapshots"
test.skip(
  !process.env.CI && process.platform === "darwin",
  "Local macOS uses darwin snapshots; run visual tests in Linux/Docker to refresh baselines"
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
