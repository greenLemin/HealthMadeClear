import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured, shouldUseMockClient } from "./env";

describe("supabase env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("isSupabaseConfigured returns true with real credentials", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "real_anon_key");
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("shouldUseMockClient returns false in production with real credentials", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "real_anon_key");
    expect(shouldUseMockClient()).toBe(false);
  });

  it("shouldUseMockClient returns true in development without credentials", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(getSupabaseUrl()).toBe("https://placeholder.supabase.co");
    expect(getSupabaseAnonKey()).toBe("placeholder_anon_key");
    expect(shouldUseMockClient()).toBe(true);
  });
});
