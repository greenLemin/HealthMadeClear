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
  await waitForAppReady(page);
  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  await firstCheckbox.check();
  await expect(firstCheckbox).toBeChecked();
  await page.reload();
  await waitForAppReady(page);
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

function getMockPassword() {
  const pwd =
    process.env.NEXT_PUBLIC_MOCK_GUEST_PASSWORD ||
    process.env.MOCK_GUEST_PASSWORD ||
    process.env.MOCK_USER_PASSWORD;
  if (!pwd) {
    if (process.env.CI)
      throw new Error("NEXT_PUBLIC_MOCK_GUEST_PASSWORD or MOCK_GUEST_PASSWORD must be set in CI");
    return "password123";
  }
  return pwd;
}

test("dashboard redirects guests to login and sign-in returns to dashboard", async ({ page }) => {
  await page.goto("/en/dashboard");
  await expect(page).toHaveURL(/\/en\/auth\/login\?redirect=%2Fdashboard/);
  await waitForAppReady(page);
  await page.getByLabel(/email address/i).fill("guest@example.com");
  await page.locator('input[type="password"]').fill(getMockPassword());
  await Promise.all([
    page.waitForURL(/\/en\/dashboard(?:\?|$)/, { timeout: 15_000 }),
    page.getByRole("button", { name: /sign in/i }).click(),
  ]);
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

test("article reader shows listed sources", async ({ page }) => {
  await page.goto("/en/articles/understanding-your-eob");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/explanation of benefits/i);
  await expect(page.getByText("CDC").first()).toBeVisible();
});

test("lesson header shows sources near the title", async ({ page }) => {
  await page.goto("/en/learn/reading-nutrition-labels");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/FDA - Nutrition Facts Label/).first()).toBeVisible();
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
  await waitForAppReady(page);
  await page
    .getByRole("button", { name: /continue/i })
    .first()
    .click();
  await page.reload();
  await waitForAppReady(page);
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

  await page.locator('input[type="password"]').fill(getMockPassword());
  await expect(passwordError).toBeHidden();
});

test("contact form submits successfully", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/en/contact");
  await waitForAppReady(page);

  await page.getByLabel(/your name/i).fill("Taylor");
  await page.getByLabel(/your email/i).fill("taylor@example.com");
  await page.getByLabel(/your message/i).fill("Testing the contact form.");
  await page.getByRole("button", { name: /send message/i }).click();

  await expect(page.getByRole("heading", { level: 1, name: /thanks for reaching out/i })).toBeVisible();
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
  // Compact-at-xl hides signup; pin the Create account / Sign in pair below xl.
  await page.setViewportSize({ width: 1024, height: 768 });
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

test("P12 search eob live region announces a count", async ({ page }) => {
  await page.goto("/en");
  await waitForAppReady(page);
  await page.getByRole("button", { name: /open search/i }).click();
  const dialog = page.getByRole("dialog", { name: /search/i });
  await dialog.getByPlaceholder(/search lessons/i).fill("eob");
  await expect(dialog.getByRole("status")).toHaveText(/\d+/, { timeout: 15_000 });
});

test("P12 visit planner next focuses the step heading", async ({ page }) => {
  await page.goto("/en/tools/visit-planner");
  await waitForAppReady(page);
  const next = page.getByRole("button", { name: /continue/i }).first();
  await expect(next).toBeEnabled({ timeout: 10_000 });
  await next.click();
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return {
      tag: el?.tagName ?? "",
      role: el?.getAttribute("role"),
      tabIndex: el instanceof HTMLElement ? el.tabIndex : null,
    };
  });
  expect(focused.tag).toBe("H2");
});

test("P13A 1440 Start learning CTA sits above the fold", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");
  await waitForAppReady(page);
  const cta = page.locator("main a[href*='/learning-paths']").filter({ hasText: /start learning/i });
  await expect(cta).toBeVisible();
  const box = await cta.boundingBox();
  expect(box, "Start learning bounding box").not.toBeNull();
  const foldBottom = box!.y + box!.height;
  console.log(`P13A fold: y=${box!.y} height=${box!.height} bottom=${foldBottom}`);
  expect(foldBottom, `CTA fold bottom ${foldBottom}`).toBeLessThan(900);
  const h1Px = await page.locator("main h1").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(h1Px, `hero H1 computed ${h1Px}px`).toBeLessThanOrEqual(56);
  const video = page.locator("main video");
  await expect(video).toBeVisible();
  await expect(video).not.toHaveAttribute("autoplay");
  expect(await video.evaluate((el) => (el as HTMLVideoElement).paused)).toBe(true);
});

test("P13B article TOC reading shell at lg", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/articles/understanding-your-eob");
  await waitForAppReady(page);

  const toc = page.getByRole("complementary", { name: /on this page/i });
  await expect(toc).toBeVisible();

  const metrics = await page.evaluate(() => {
    const article = document.getElementById("article-body");
    const aside = document.querySelector("aside");
    const mains = Array.from(document.querySelectorAll("main#main-content"));
    const paragraphs = article ? Array.from(article.querySelectorAll("p")) : [];
    const maxParagraph = paragraphs.reduce((max, p) => Math.max(max, p.getBoundingClientRect().width), 0);
    const ar = article?.getBoundingClientRect();
    const as = aside?.getBoundingClientRect();
    const gap = ar && as ? as.left - ar.right : null;
    const following =
      article && aside ? article.compareDocumentPosition(aside) & Node.DOCUMENT_POSITION_FOLLOWING : 0;
    return {
      maxParagraph,
      gap,
      following: following !== 0,
      mainCount: mains.length,
      articleBeforeAside: !!(
        article &&
        aside &&
        article.compareDocumentPosition(aside) === Node.DOCUMENT_POSITION_FOLLOWING
      ),
    };
  });

  console.log(
    `P13B-1 gap=${metrics.gap} maxParagraph=${metrics.maxParagraph} mainCount=${metrics.mainCount}`
  );
  expect(metrics.maxParagraph, `paragraph max width ${metrics.maxParagraph}`).toBeLessThanOrEqual(720);
  expect(metrics.following, "article must precede aside in DOM").toBe(true);
  expect(metrics.mainCount, "exactly one main#main-content").toBe(1);
  expect(metrics.gap, `TOC–prose gap ${metrics.gap}`).not.toBeNull();
  expect(metrics.gap!, `TOC–prose gap ${metrics.gap}px`).toBeLessThanOrEqual(80);
});

test("P14 learn titles render in both locales", async ({ page }) => {
  await page.goto("/en/learn");
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/es/learn");
  await waitForAppReady(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("P15 lesson print control and print-only disclaimer exist", async ({ page }) => {
  await page.goto("/en/learn/understanding-prescription-labels");
  await waitForAppReady(page);
  await expect(page.getByRole("button", { name: /print/i })).toBeVisible();
  const disclaimer = page.getByText(/does not replace medical advice/i);
  await expect(disclaimer).toBeAttached();
  await expect(disclaimer).toBeHidden();
});
