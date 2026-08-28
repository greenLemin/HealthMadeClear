import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const snippet = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "..", "public", "ga-init.js"),
  "utf8"
);

describe("public/ga-init.js", () => {
  it("sets page_location to origin + pathname and does not send href or anonymize_ip", () => {
    expect(snippet).toContain("page_location");
    expect(snippet).toContain("window.location.origin + window.location.pathname");
    expect(snippet).not.toContain("window.location.href");
    expect(snippet).not.toContain("anonymize_ip");
  });
});
