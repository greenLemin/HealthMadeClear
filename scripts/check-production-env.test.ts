import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "check-production-env.mjs");

function runCheck(env: Record<string, string | undefined>) {
  return spawnSync(process.execPath, [scriptPath], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
}

describe("check-production-env.mjs", () => {
  it("exits 0 when CI is not true", () => {
    const result = runCheck({ CI: "false" });
    expect(result.status).toBe(0);
  });

  it("exits 1 when CI is true and Supabase vars are missing", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.org",
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      SUPABASE_ANON_KEY: undefined,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Missing Supabase public env vars");
    expect(result.stderr).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("bridges SUPABASE_ANON_KEY to NEXT_PUBLIC_SUPABASE_ANON_KEY", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.org",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      SUPABASE_ANON_KEY: "legacy_anon_key_value",
    });
    expect(result.status).toBe(0);
  });

  it("rejects placeholder Supabase credentials", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.org",
      NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "placeholder_anon_key",
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Missing Supabase public env vars");
  });

  it("passes with valid Supabase credentials on CI", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.org",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "real_anon_key_value",
    });
    expect(result.status).toBe(0);
  });
});
