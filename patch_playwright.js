const fs = require('fs');
const path = 'playwright.config.ts';
let content = fs.readFileSync(path, 'utf8');

// Ensure viewport is configured for e2e tests
// If we have projects -> chromium, ensure it has viewport: { width: 1280, height: 800 }
// Find devices['Desktop Chrome']
content = content.replace(
  /name: 'chromium',\n\s+use: { \.\.\.devices\['Desktop Chrome'\] },/,
  "name: 'chromium',\n      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },"
);

fs.writeFileSync(path, content);
