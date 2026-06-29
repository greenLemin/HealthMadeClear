import { expect, signInMockUser, test, waitForAppReady } from "./setup";

test("lesson detail and mark complete", async ({ page }) => {
  await page.goto("/en/learn/understanding-prescription-labels");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/prescription/i);
  await page.getByRole("button", { name: /mark as complete/i }).click();
  await signInMockUser(page);
  await expect(page).toHaveURL(/\/en\/dashboard(?:\?|$)/);
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
  await signInMockUser(page);
  await expect(page).toHaveURL(/\/en\/dashboard(?:\?|$)/);
  await expect(page.getByRole("button", { name: /export progress/i })).toBeVisible();
});

test("dashboard redirects guests to login and sign-in returns to dashboard", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/auth\/login\?redirect=%2Fdashboard/);
  await page.getByLabel(/email address/i).fill("guest@example.com");
  await page.locator('input[type="password"]').fill("password123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/en\/dashboard(?:\?|$)/);
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

test("quiz keeps a visible page heading during active questions and results", async ({ page }) => {
  await page.goto("/en/learn/understanding-prescription-labels/quiz");
  await page.getByRole("button", { name: /start quiz/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/prescription labels quiz/i);

  const quizMain = page.getByRole("main");
  for (let i = 0; i < 10; i++) {
    await quizMain.getByRole("radio").first().click();
    const checkButton = quizMain.getByRole("button", { name: /check answer/i });
    if (await checkButton.isVisible()) {
      await checkButton.click();
    }
    const nextButton = quizMain.getByRole("button", { name: /next question|see results/i });
    await nextButton.click();
  }

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/prescription labels quiz/i);
});

test("search and display overlays expose explicit dismiss controls", async ({ page }) => {
  await page.goto("/en");
  await waitForAppReady(page);

  await page.getByRole("button", { name: /open search/i }).click();
  const searchDialog = page.getByRole("dialog", { name: /search/i });
  await expect(searchDialog.getByRole("button", { name: /close search/i })).toBeVisible();
  await searchDialog.getByRole("button", { name: /close search/i }).click();

  await page.getByRole("button", { name: /display/i }).click();
  const displayDialog = page.getByRole("dialog", { name: /accessibility controls/i });
  await expect(displayDialog.getByRole("heading", { level: 2 })).toContainText(/accessibility controls/i);
  await expect(displayDialog.getByRole("button", { name: /dismiss/i })).toBeVisible();
});

test("login validation clears as fields are corrected", async ({ page }) => {
  await page.goto("/en/auth/login");
  await page.getByRole("button", { name: /sign in/i }).click();

  const emailError = page.getByText(/please enter your email address\./i);
  const passwordError = page.getByText(/please enter your password\./i);
  await expect(emailError).toBeVisible();
  await expect(passwordError).toBeVisible();

  await page.getByLabel(/email address/i).fill("test@example.com");
  await expect(emailError).toBeHidden();

  await page.locator('input[type="password"]').fill("password123");
  await expect(passwordError).toBeHidden();
});

test("contact form validation clears as fields are corrected", async ({ page }) => {
  await page.goto("/en/contact");
  await waitForAppReady(page);

  await page.getByRole("button", { name: /send message/i }).click();

  const nameError = page.getByText(/please enter your name\./i);
  const emailError = page.getByText(/please enter your email address\./i);
  const messageError = page.getByText(/please enter your message\./i);
  await expect(nameError).toBeVisible();
  await expect(emailError).toBeVisible();
  await expect(messageError).toBeVisible();

  await page.getByLabel(/your name/i).fill("Taylor");
  await expect(nameError).toBeHidden();

  await page.getByLabel(/your email/i).fill("taylor@example.com");
  await expect(emailError).toBeHidden();

  await page.getByLabel(/your message/i).fill("Testing the contact form.");
  await expect(messageError).toBeHidden();
});

test("header reflects guest and signed-in states", async ({ page }) => {
  await page.goto("/en");
  await waitForAppReady(page);
  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: /create account/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /log in|sign in/i })).toBeVisible();

  await signInMockUser(page, "/");
  await expect(page).toHaveURL(/\/en(?:\/)?$/);
  await expect(page.getByRole("link", { name: /guest student/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /log out/i })).toBeVisible();

  await page.getByRole("button", { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/en(?:\/)?$/);
  await expect(header.getByRole("link", { name: /create account/i })).toBeVisible();
  await expect(header.getByRole("link", { name: /log in|sign in/i })).toBeVisible();
});
