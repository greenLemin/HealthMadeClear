import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const scriptPath = join(dirname(fileURLToPath(import.meta.url)), "check-production-env.mjs");

const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_DATABASE_URL",
] as const;

function runCheck(env: Record<string, string | undefined>) {
  const baseEnv = { ...process.env };
  for (const key of SUPABASE_ENV_KEYS) {
    delete baseEnv[key];
  }

  return spawnSync(process.execPath, [scriptPath], {
    env: { ...baseEnv, ...env },
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
      URL: "https://healthmadeclear.netlify.app",
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      SUPABASE_ANON_KEY: undefined,
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Missing Supabase public env vars");
    expect(result.stderr).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });

  it("bridges SUPABASE_URL and SUPABASE_ANON_KEY legacy names", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.netlify.app",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "legacy_anon_key_value",
    });
    expect(result.status).toBe(0);
  });

  it("derives NEXT_PUBLIC_SUPABASE_URL from SUPABASE_DATABASE_URL (REST URL)", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.netlify.app",
      SUPABASE_DATABASE_URL: "https://xdmbyadosmzixsxqullj.supabase.co",
      SUPABASE_ANON_KEY: "real_anon_key_value",
    });
    expect(result.status).toBe(0);
  });

  it("derives NEXT_PUBLIC_SUPABASE_URL from SUPABASE_DATABASE_URL (postgres fallback)", () => {
    const result = runCheck({
      CI: "true",
      NETLIFY: "true",
      URL: "https://healthmadeclear.netlify.app",
      SUPABASE_DATABASE_URL: "postgresql://postgres.abc123:pw@db.abc123.supabase.co:5432/postgres",
      SUPABASE_ANON_KEY: "real_anon_key_value",
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
