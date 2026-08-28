import { expect, test, waitForAppReady } from "./setup";

test("EN care guide shows disclaimer and 911", async ({ page }) => {
  await page.goto("/en/tools/care-guide");
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { level: 1, name: /how care settings differ/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /911/ })).toBeVisible();
  await expect(
    page.getByText(/educational purposes only|do not rely on this platform/i).first()
  ).toBeVisible();
});

test("EN articles catalog shows educational disclaimer text", async ({ page }) => {
  await page.goto("/en/articles");
  await waitForAppReady(page);
  await expect(page.getByText(/this content is for educational purposes only/i)).toBeVisible();
});

test("ES care guide is Spanish", async ({ page }) => {
  await page.goto("/es/tools/care-guide");
  await waitForAppReady(page);
  await expect(
    page.getByRole("heading", { level: 1, name: /cómo se diferencian los lugares de atención/i })
  ).toBeVisible();
});
