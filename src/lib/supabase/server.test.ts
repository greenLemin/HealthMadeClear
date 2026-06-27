import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createClient } from "./server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getMockSupabaseClient } from "./mockClient";
import { getSupabaseAnonKey, getSupabaseUrl, shouldUseMockClient } from "./env";

// Mock dependencies
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("./mockClient", () => ({
  getMockSupabaseClient: vi.fn(),
}));

vi.mock("./env", () => ({
  getSupabaseAnonKey: vi.fn(),
  getSupabaseUrl: vi.fn(),
  shouldUseMockClient: vi.fn(),
}));

describe("supabase server createClient", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    mockCookieStore = {
      getAll: vi.fn(),
      set: vi.fn(),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should use mock client when shouldUseMockClient returns true", async () => {
    vi.mocked(shouldUseMockClient).mockReturnValue(true);
    const mockClient = { auth: {} }; // Dummy mock client
    vi.mocked(getMockSupabaseClient).mockReturnValue(mockClient as any);

    const client = await createClient();

    expect(shouldUseMockClient).toHaveBeenCalled();
    expect(cookies).toHaveBeenCalled();
    expect(getMockSupabaseClient).toHaveBeenCalledWith(mockCookieStore);
    expect(client).toBe(mockClient);
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("should use real client when shouldUseMockClient returns false", async () => {
    vi.mocked(shouldUseMockClient).mockReturnValue(false);
    vi.mocked(getSupabaseUrl).mockReturnValue("https://real.supabase.co");
    vi.mocked(getSupabaseAnonKey).mockReturnValue("real_key");

    const realClient = { auth: {} };
    vi.mocked(createServerClient).mockReturnValue(realClient as any);

    const client = await createClient();

    expect(shouldUseMockClient).toHaveBeenCalled();
    expect(getSupabaseUrl).toHaveBeenCalled();
    expect(getSupabaseAnonKey).toHaveBeenCalled();
    expect(cookies).toHaveBeenCalled();

    // Check that createServerClient was called with correct arguments
    expect(createServerClient).toHaveBeenCalledWith(
      "https://real.supabase.co",
      "real_key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );

    expect(client).toBe(realClient);

    // Test cookies.getAll
    const createServerClientArgs = vi.mocked(createServerClient).mock.calls[0];
    const cookiesConfig = createServerClientArgs[2]?.cookies;

    expect(cookiesConfig).toBeDefined();

    mockCookieStore.getAll.mockReturnValue([{ name: "test", value: "value" }]);
    const allCookies = cookiesConfig!.getAll!();
    expect(mockCookieStore.getAll).toHaveBeenCalled();
    expect(allCookies).toEqual([{ name: "test", value: "value" }]);

    // Test cookies.setAll
    const cookiesToSet = [
      { name: "test1", value: "value1", options: { path: "/" } },
      { name: "test2", value: "value2", options: { path: "/api" } },
    ];

    // @ts-expect-error type discrepancy in @supabase/ssr setAll mock
    cookiesConfig!.setAll!(cookiesToSet as any);
    expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    expect(mockCookieStore.set).toHaveBeenNthCalledWith(1, "test1", "value1", { path: "/" });
    expect(mockCookieStore.set).toHaveBeenNthCalledWith(2, "test2", "value2", { path: "/api" });

    // Test cookies.setAll ignoring errors
    mockCookieStore.set.mockImplementationOnce(() => {
      throw new Error("Set cookie failed");
    });

    expect(() => {
      // @ts-expect-error type discrepancy in @supabase/ssr setAll mock
      cookiesConfig!.setAll!([{ name: "test3", value: "value3", options: {} }] as any);
    }).not.toThrow();
  });
});
