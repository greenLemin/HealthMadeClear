import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  checkSecurityHeaders,
  extractConnectSrcTokens,
  hasPinnedProjectRef,
  hasUnsafeInlineScriptSrc,
  tokensEqual,
} from "./check-security-headers.mjs";

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "check-security-headers.mjs");

const CANONICAL = [
  "'self'",
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://*.ingest.sentry.io",
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
];

const MATCHING_CSP = `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src ${CANONICAL.join(" ")}`;

function nextConfigWithCsp(csp: string) {
  return `const securityHeaders = [{ key: "Content-Security-Policy", value: "${csp}" }];\n`;
}

function netlifyWithCsp(csp: string) {
  return `[[headers]]\n  for = "/*"\n  [headers.values]\n    Content-Security-Policy = "${csp}"\n`;
}

describe("check-security-headers helpers", () => {
  it("extracts connect-src tokens from next.config and netlify CSP strings", () => {
    expect(extractConnectSrcTokens(nextConfigWithCsp(MATCHING_CSP))).toEqual(CANONICAL);
    expect(extractConnectSrcTokens(netlifyWithCsp(MATCHING_CSP))).toEqual(CANONICAL);
  });

  it("treats token order as irrelevant", () => {
    expect(tokensEqual(["'self'", "https://*.supabase.co"], ["https://*.supabase.co", "'self'"])).toBe(true);
  });

  it("flags pinned project-ref hosts", () => {
    expect(hasPinnedProjectRef(["https://xdmbyadosmzixsxqullj.supabase.co"])).toBe(true);
    expect(hasPinnedProjectRef(["https://*.supabase.co", "wss://*.supabase.co"])).toBe(false);
    expect(hasPinnedProjectRef(["https://*.ingest.sentry.io"])).toBe(false);
  });

  it("requires script-src 'unsafe-inline'", () => {
    expect(hasUnsafeInlineScriptSrc(MATCHING_CSP)).toBe(true);
    expect(hasUnsafeInlineScriptSrc("script-src 'self' 'sha256-abc'")).toBe(false);
  });

  it("fails when netlify connect-src diverges from next.config", () => {
    const drifted = MATCHING_CSP.replace("https://*.ingest.sentry.io ", "");
    const result = checkSecurityHeaders({
      nextSource: nextConfigWithCsp(MATCHING_CSP),
      netlifySource: netlifyWithCsp(drifted),
      canonicalTokens: CANONICAL,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("netlify.toml connect-src diverges"))).toBe(true);
  });

  it("fails when a source pins a supabase project ref", () => {
    const pinned = MATCHING_CSP.replace("https://*.supabase.co", "https://xdmbyadosmzixsxqullj.supabase.co");
    const result = checkSecurityHeaders({
      nextSource: nextConfigWithCsp(pinned),
      netlifySource: netlifyWithCsp(MATCHING_CSP),
      canonicalTokens: CANONICAL,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("pins a project-ref host"))).toBe(true);
  });
});

describe("check-security-headers.mjs (spawn)", () => {
  it("exits 0 against the repo next.config.mjs, netlify.toml, and security-headers.json", () => {
    const result = spawnSync(process.execPath, [scriptPath], { encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("connect-src matches canonical list");
  });

  it("exits 1 when fixture connect-src diverges", () => {
    const dir = mkdtempSync(join(tmpdir(), "hmc-csp-"));
    const driftedCsp = `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src ${CANONICAL.filter((t) => t !== "https://*.ingest.sentry.io").join(" ")}`;
    writeFileSync(join(dir, "next.config.mjs"), nextConfigWithCsp(MATCHING_CSP));
    writeFileSync(join(dir, "netlify.toml"), netlifyWithCsp(driftedCsp));
    writeFileSync(join(dir, "security-headers.json"), JSON.stringify({ "connect-src": CANONICAL }));

    const result = spawnSync(
      process.execPath,
      [
        scriptPath,
        "--next",
        join(dir, "next.config.mjs"),
        "--netlify",
        join(dir, "netlify.toml"),
        "--canonical",
        join(dir, "security-headers.json"),
      ],
      { encoding: "utf8" }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("security-headers check failed");
  });
});
