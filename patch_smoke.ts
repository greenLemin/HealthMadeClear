import fs from "fs";

let content = fs.readFileSync("e2e/smoke.spec.ts", "utf8");
content = content.replace(
  /await page.locator\('header a\[href="\/en\/learn"\]'\).click\(\);/,
  "await page.locator('header a[href=\"/en/learn\"]').first().click();"
);

fs.writeFileSync("e2e/smoke.spec.ts", content);
