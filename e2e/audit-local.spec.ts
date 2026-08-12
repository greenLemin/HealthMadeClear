import { expect, test } from "@playwright/test";
import { writeFileSync } from "fs";

const LIVE_URL = "http://127.0.0.1:3000";

// Collect errors during run
interface AuditResult {
  url: string;
  viewport: string;
  locale: string;
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: string[];
  failedRequests: string[];
  missingAlts: string[];
  potentialUnTranslated: string[];
  layoutOverflow: boolean;
}

const auditResults: AuditResult[] = [];

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
];

const PAGES = [
  // English
  { locale: "en", path: "/en" },
  { locale: "en", path: "/en/learn" },
  { locale: "en", path: "/en/learning-paths" },
  { locale: "en", path: "/en/learning-paths/safer-medicine-use" },
  { locale: "en", path: "/en/learn/understanding-prescription-labels" },
  { locale: "en", path: "/en/learn/understanding-prescription-labels/quiz" },
  { locale: "en", path: "/en/articles" },
  { locale: "en", path: "/en/articles/understanding-your-eob" },
  { locale: "en", path: "/en/glossary" },
  { locale: "en", path: "/en/glossary/hypertension" },
  { locale: "en", path: "/en/tools" },
  { locale: "en", path: "/en/tools/care-guide" },
  { locale: "en", path: "/en/tools/visit-checklist" },
  { locale: "en", path: "/en/tools/visit-planner" },
  { locale: "en", path: "/en/about" },
  { locale: "en", path: "/en/accessibility" },
  { locale: "en", path: "/en/privacy" },
  { locale: "en", path: "/en/terms" },
  { locale: "en", path: "/en/contact" },
  { locale: "en", path: "/en/auth/login" },
  { locale: "en", path: "/en/auth/signup" },
  { locale: "en", path: "/en/auth/forgot-password" },

  // Spanish
  { locale: "es", path: "/es" },
  { locale: "es", path: "/es/learn" },
  { locale: "es", path: "/es/learning-paths" },
  { locale: "es", path: "/es/learning-paths/safer-medicine-use" },
  { locale: "es", path: "/es/learn/understanding-prescription-labels" },
  { locale: "es", path: "/es/learn/understanding-prescription-labels/quiz" },
  { locale: "es", path: "/es/articles" },
  { locale: "es", path: "/es/articles/understanding-your-eob" },
  { locale: "es", path: "/es/glossary" },
  { locale: "es", path: "/es/glossary/hypertension" },
  { locale: "es", path: "/es/tools" },
  { locale: "es", path: "/es/tools/care-guide" },
  { locale: "es", path: "/es/tools/visit-checklist" },
  { locale: "es", path: "/es/tools/visit-planner" },
  { locale: "es", path: "/es/about" },
  { locale: "es", path: "/es/accessibility" },
  { locale: "es", path: "/es/privacy" },
  { locale: "es", path: "/es/terms" },
  { locale: "es", path: "/es/contact" },
  { locale: "es", path: "/es/auth/login" },
  { locale: "es", path: "/es/auth/signup" },
  { locale: "es", path: "/es/auth/forgot-password" },
];

test.describe("Exhaustive UI/UX local site audit", () => {
  test.afterAll(() => {
    writeFileSync("audit-results-local-raw.json", JSON.stringify(auditResults, null, 2));
    console.log("Raw local audit results saved to audit-results-local-raw.json");
  });

  for (const pageInfo of PAGES) {
    for (const vp of VIEWPORTS) {
      test(`Audit ${pageInfo.path} on ${vp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });

        // Listeners for errors/logs
        const consoleErrors: string[] = [];
        const consoleWarnings: string[] = [];
        const pageErrors: string[] = [];
        const failedRequests: string[] = [];

        page.on("console", (msg) => {
          if (msg.type() === "error") {
            consoleErrors.push(msg.text());
          } else if (msg.type() === "warning") {
            consoleWarnings.push(msg.text());
          }
        });

        page.on("pageerror", (err) => {
          pageErrors.push(err.message + (err.stack ? "\n" + err.stack : ""));
        });

        page.on("requestfailed", (req) => {
          failedRequests.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText || "failed"}`);
        });

        // Navigate
        const targetUrl = LIVE_URL + pageInfo.path;

        try {
          const res = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
          await page.waitForTimeout(500); // let things settle

          if (!res) {
            failedRequests.push(`Navigation returned null response for ${targetUrl}`);
          } else if (res.status() >= 400) {
            failedRequests.push(`HTTP ${res.status()} response for ${targetUrl}`);
          }
        } catch (e: any) {
          pageErrors.push(`Goto failed: ${e.message}`);
        }

        // 1. Accessibility Checks: Missing Alt Texts
        const missingAlts = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll("img"));
          return imgs
            .filter((img) => !img.getAttribute("alt") && img.getAttribute("alt") !== "")
            .map((img) => img.src || img.outerHTML);
        });

        // 2. Localization Checks: Untranslated keys or brackets
        const potentialUnTranslated = await page.evaluate(() => {
          const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
              const parent = node.parentElement;
              if (parent && (parent.tagName === "SCRIPT" || parent.tagName === "STYLE")) {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_ACCEPT;
            },
          });
          const results: string[] = [];
          let node;
          while ((node = walk.nextNode())) {
            const val = node.nodeValue || "";
            // Look for missing translation indicators
            if (
              val.includes("t(") ||
              val.includes("missing translation") ||
              (val.startsWith("[") && val.endsWith("]"))
            ) {
              results.push(val.trim());
            }
          }
          return results;
        });

        // 3. Layout checks: Horizontal Overflow (Viewport shift)
        const layoutOverflow = await page.evaluate((width) => {
          return document.documentElement.scrollWidth > width;
        }, vp.width);

        auditResults.push({
          url: pageInfo.path,
          viewport: vp.name,
          locale: pageInfo.locale,
          consoleErrors,
          consoleWarnings,
          pageErrors,
          failedRequests,
          missingAlts,
          potentialUnTranslated,
          layoutOverflow,
        });
      });
    }
  }
});
