import { test, expect, signInMockUser, waitForAppReady } from "./setup";

test.describe("UI Polish & Responsiveness", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  const routes = [
    "/en",
    "/en/learn",
    "/en/glossary",
    "/en/learning-paths",
    "/en/tools",
    "/en/tools/visit-planner",
    "/en/tools/visit-checklist",
    "/en/tools/care-guide",
    "/en/about",
    "/en/contact",
    "/en/privacy",
    "/en/terms",
    "/en/accessibility",
  ];

  for (const route of routes) {
    test(`no horizontal overflow on ${route}`, async ({ page }) => {
      await page.goto(route);
      await waitForAppReady(page);
      // Allow layout animations to settle before measuring overflow
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;

        let overflowingElement = "";
        if (scrollWidth > docWidth || bodyScrollWidth > docWidth) {
          const all = document.querySelectorAll("*");
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth) {
              overflowingElement = `${el.tagName}.${el.className} (right: ${rect.right}px, clientWidth: ${docWidth}px)`;
              break;
            }
          }
          return { hasOverflow: true, overflowingElement, scrollWidth, bodyScrollWidth, docWidth };
        }
        return { hasOverflow: false };
      });

      expect(
        overflow.hasOverflow,
        `Route ${route} has horizontal overflow: ${overflow.overflowingElement}`
      ).toBe(false);
    });
  }

  test("no horizontal overflow on /en/dashboard", async ({ page }) => {
    await signInMockUser(page);
    await page.goto("/en/dashboard");
    await waitForAppReady(page);

    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const bodyScrollWidth = document.body.scrollWidth;

      if (scrollWidth > docWidth || bodyScrollWidth > docWidth) {
        return { hasOverflow: true };
      }
      return { hasOverflow: false };
    });

    expect(overflow.hasOverflow).toBe(false);
  });

  test("tab keyboard navigation on home page", async ({ page }) => {
    await page.goto("/en");
    await waitForAppReady(page);

    // Tab to first element
    await page.keyboard.press("Tab");

    const hasFocus = await page.evaluate(() => {
      const active = document.activeElement;
      return active && active !== document.body;
    });

    expect(hasFocus).toBe(true);
  });
});
