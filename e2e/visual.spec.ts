import { expect, test, waitForAppReady } from "./setup";
import type { Page } from "@playwright/test";

// Full-page visual baselines are OS-specific. Run locally on Linux (or Docker) to refresh:
//   docker run --rm -v "$PWD":/work -w /work -e CI=true mcr.microsoft.com/playwright:v1.60.0-noble \
//     bash -c "npm ci && npx playwright test e2e/visual.spec.ts --update-snapshots"

const skipLocalVisualBaselines = !process.env.CI && process.platform !== "linux";

const LOGIN_NAME = /sign in|iniciar sesión/i;
const HAMBURGER_NAME = /toggle navigation|abrir navegación/i;
const MAIN_NAV_NAME = /main navigation|navegación principal/i;

async function headerInnerBarSize(page: Page) {
  return page.locator("header .surface-card-glass").evaluate((glass) => {
    const bar = glass.querySelector(":scope > .flex") as HTMLElement | null;
    const target = bar ?? (glass as HTMLElement);
    return { scrollWidth: target.scrollWidth, clientWidth: target.clientWidth };
  });
}

async function openAccordion(page: Page) {
  const hamburger = page.getByRole("banner").getByRole("button", { name: HAMBURGER_NAME });
  await expect(hamburger).toBeVisible();
  await hamburger.click();
  const menu = page.locator("#mobile-menu");
  await expect(menu).toBeVisible();
  return menu;
}

test.describe("visual baselines", () => {
  test.skip(
    skipLocalVisualBaselines,
    "Local visual baselines are only maintained on Linux/Docker; skip macOS and Windows captures"
  );

  test("home visual baseline light", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await waitForAppReady(page);
    await expect(page).toHaveScreenshot("home-en-light.png", { fullPage: true });
  });

  test("home visual baseline dark", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    await waitForAppReady(page);
    await page.getByRole("button", { name: /display/i }).click();
    await page.getByRole("radio", { name: /dark/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page).toHaveScreenshot("home-en-dark.png", { fullPage: true });
  });
});

test.describe("P10 header compact-at-xl", () => {
  test("1440 desktop nav visible in header and hamburger hidden", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    await waitForAppReady(page);

    const header = page.getByRole("banner");
    const desktopNav = header.getByRole("navigation", { name: MAIN_NAV_NAME });
    await expect(desktopNav).toBeVisible();
    await expect(header.getByRole("button", { name: HAMBURGER_NAME })).toBeHidden();
    await expect(page.locator("#mobile-menu")).toHaveCount(0);

    await expect(desktopNav.getByRole("link")).toHaveCount(8);
    await expect(desktopNav.getByRole("link", { name: /^paths$/i })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: /^tools$/i })).toBeVisible();
    await expect(desktopNav.getByRole("link", { name: /^about$/i })).toBeVisible();
    await expect(desktopNav.getByRole("combobox")).toHaveCount(0);
    await expect(desktopNav.getByRole("button")).toHaveCount(0);
  });

  for (const width of [1280, 1440] as const) {
    for (const locale of ["en", "es"] as const) {
      test(`${width} /${locale} header inner bar does not overflow`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 1280 ? 800 : 900 });
        await page.goto(`/${locale}`);
        await waitForAppReady(page);

        const size = await headerInnerBarSize(page);
        expect(
          size.scrollWidth,
          `/${locale} @${width}: inner bar scrollWidth ${size.scrollWidth} > clientWidth ${size.clientWidth}`
        ).toBeLessThanOrEqual(size.clientWidth);
      });
    }
  }

  test("1280 login control exists and login word is visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    await waitForAppReady(page);

    const header = page.getByRole("banner");
    const login = header.getByRole("link", { name: LOGIN_NAME });
    await expect(login).toBeVisible();
    await expect(login.getByText(LOGIN_NAME)).toBeVisible();
  });

  test("404 home button is visible and at least 44px tall", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/this-page-does-not-exist");
    await page.waitForLoadState("load");

    const home = page.getByRole("link", { name: /go home|ir al inicio/i }).first();
    await expect(home).toBeVisible({ timeout: 15_000 });
    const box = await home.boundingBox();
    expect(box, "home button bounding box").not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("P10 accordion hamburger-by-design", () => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1024, height: 768 },
  ] as const) {
    test(`${viewport.width}x${viewport.height} hamburger opens scrollable sibling sheet`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(viewport);
      await page.goto("/en");
      await waitForAppReady(page);

      const menu = await openAccordion(page);

      const geometry = await menu.evaluate((el) => {
        const glass = document.querySelector("header .surface-card-glass");
        const parent = el.parentElement;
        const style = getComputedStyle(el);
        const lastAuth =
          el.querySelector<HTMLElement>('a[href*="signup"]') ??
          el.querySelector<HTMLElement>('a[href*="login"]');
        const docYBefore = window.scrollY;
        const bodyYBefore = document.body.scrollTop;
        if (lastAuth) {
          const er = lastAuth.getBoundingClientRect();
          const mr = el.getBoundingClientRect();
          if (er.bottom > mr.bottom) el.scrollTop += er.bottom - mr.bottom + 8;
          if (er.top < mr.top) el.scrollTop -= mr.top - er.top + 8;
        }
        const er = lastAuth?.getBoundingClientRect();
        const mr = el.getBoundingClientRect();
        const inMenu = !!er && er.top >= mr.top - 8 && er.bottom <= mr.bottom + 8 && er.left >= mr.left - 8;
        return {
          childOfGlass: glass?.contains(el) ?? true,
          parentOverflow: parent ? getComputedStyle(parent).overflow : "",
          overflowY: style.overflowY,
          bg: style.backgroundColor,
          backdrop:
            style.backdropFilter ||
            (style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter ||
            "",
          className: el.className,
          bodyOverflow: getComputedStyle(document.body).overflow,
          docYBefore,
          docYAfter: window.scrollY,
          bodyYBefore,
          bodyYAfter: document.body.scrollTop,
          inMenu,
          lastAuthFound: !!lastAuth,
        };
      });

      expect(geometry.childOfGlass, "accordion must be sibling of glass, not child").toBe(false);
      expect(geometry.parentOverflow).toMatch(/visible/);
      expect(geometry.overflowY).toMatch(/auto|scroll/);
      expect(geometry.className).toContain("bg-surface-container-lowest");
      expect(geometry.backdrop.replace(/\s/g, "")).toMatch(/^(none)?$/);
      expect(geometry.lastAuthFound).toBe(true);
      expect(geometry.inMenu, "last auth control must be in view inside the menu").toBe(true);
      expect(geometry.docYAfter).toBe(geometry.docYBefore);
      expect(geometry.bodyYAfter).toBe(geometry.bodyYBefore);
      expect(geometry.bodyOverflow).toMatch(/hidden/);
    });
  }
});

test.describe("P11 touch targets at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("footer About link box is at least 44px tall", async ({ page }) => {
    await page.goto("/en");
    await waitForAppReady(page);
    const about = page.getByRole("contentinfo").getByRole("link", { name: /^about$/i });
    await about.scrollIntoViewIfNeeded();
    const box = await about.boundingBox();
    expect(box, "footer About bounding box").not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("glossary letter row overflow-x and related-lesson hit area", async ({ page }) => {
    await page.goto("/en/glossary");
    await waitForAppReady(page);

    const letterA = page.getByRole("button", { name: /^A$/ });
    await expect(letterA).toBeVisible();
    const overflowX = await letterA.evaluate((el) => getComputedStyle(el.parentElement!).overflowX);
    expect(overflowX).toMatch(/auto|scroll/);

    const relatedLesson = page.locator("#main-content a[href*='/learn/']").first();
    await expect(relatedLesson).toBeVisible();
    const box = await relatedLesson.boundingBox();
    expect(box, "related-lesson link bounding box").not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("contact subject select is min-h-12", async ({ page }) => {
    await page.goto("/en/contact");
    await waitForAppReady(page);
    const select = page.getByLabel(/subject/i);
    await expect(select).toBeVisible();
    const metrics = await select.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        minHeight: parseFloat(style.minHeight),
        height: (el as HTMLElement).getBoundingClientRect().height,
      };
    });
    expect(metrics.minHeight).toBeGreaterThanOrEqual(48);
    expect(metrics.height).toBeGreaterThanOrEqual(48);
  });

  test("learn filter pill is at least 44px tall", async ({ page }) => {
    await page.goto("/en/learn");
    await waitForAppReady(page);
    const pill = page.getByRole("button", { name: /all topics/i });
    await expect(pill).toBeVisible();
    const box = await pill.boundingBox();
    expect(box, "learn filter pill bounding box").not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
