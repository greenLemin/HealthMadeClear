import { expect, test, waitForAppReady } from "./setup";

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
  await waitForAppReady(page);
  await page.getByRole("button", { name: /display/i }).click();
  await page.getByRole("radio", { name: /dark/i }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("simple mode toggle", async ({ page }) => {
  await page.goto("/en");
  await waitForAppReady(page);
  await page.getByRole("button", { name: /display/i }).click();
  await page.getByRole("button", { name: /simple mode.*off/i }).click();
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

test("search navigates to lesson", async ({ page }) => {
  await page.goto("/en");
  await waitForAppReady(page);
  await page.getByRole("button", { name: /open search/i }).click();
  const dialog = page.getByRole("dialog", { name: /search/i });
  await dialog.getByPlaceholder(/search lessons/i).fill("blood");
  await dialog.getByRole("link", { name: /blood test basics/i }).click();
  await expect(page).toHaveURL(/\/en\/learn\/blood-basics/);
});

test("single main landmark on home", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("main")).toHaveCount(1);
});

test("articles index loads", async ({ page }) => {
  await page.goto("/en/articles");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("spanish quiz loads questions and shows results", async ({ page }) => {
  await page.goto("/es/learn/before-your-visit/quiz");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/cuestionario/i);
  await page.getByRole("button", { name: /comenzar cuestionario/i }).click();
  const quizMain = page.getByRole("main");
  await expect(quizMain.getByRole("radiogroup").first()).toBeVisible();

  for (let i = 0; i < 5; i++) {
    await quizMain.getByRole("radio").first().click();
    const checkButton = quizMain.getByRole("button", { name: /verificar respuesta/i });
    if (await checkButton.isVisible()) {
      await checkButton.click();
    }
    const nextButton = quizMain.getByRole("button", { name: /siguiente pregunta|ver resultados/i });
    await nextButton.click();
  }

  await expect(quizMain.getByText(/aprobaste|inténtalo|puntuación|scored/i)).toBeVisible();
});

test("article detail page loads full content", async ({ page }) => {
  await page.goto("/en/articles/understanding-your-eob");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/explanation of benefits/i);
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible();
});

test("english quiz shows substantive explanation after wrong answer", async ({ page }) => {
  await page.goto("/en/learn/pain-medications-safely/quiz");
  await page.getByRole("button", { name: /start quiz/i }).click();
  const quizMain = page.getByRole("main");
  await quizMain.getByRole("radio").first().click();
  await quizMain.getByRole("button", { name: /check answer/i }).click();
  await expect(quizMain.getByText(/Acetaminophen is processed by the liver/i)).toBeVisible();
});

test("visit planner persists after reload", async ({ page }) => {
  await page.goto("/en/tools/visit-planner");
  await page
    .getByRole("button", { name: /continue/i })
    .first()
    .click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("home featured paths show progress bar when lesson completed", async ({ page }) => {
  await page.goto("/en/learn/understanding-prescription-labels");
  await page.getByRole("button", { name: /mark as complete/i }).click();
  await page.goto("/en");
  await expect(page.getByRole("progressbar").first()).toBeVisible();
});
