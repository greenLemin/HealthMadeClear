import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "./client";
import { createBrowserClient } from "@supabase/ssr";
import { getMockSupabaseClient } from "./mockClient";
import { getSupabaseAnonKey, getSupabaseUrl, shouldUseMockClient } from "./env";

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: vi.fn(),
}));

vi.mock("./mockClient", () => ({
  getMockSupabaseClient: vi.fn(),
}));

vi.mock("./env", () => ({
  getSupabaseAnonKey: vi.fn(),
  getSupabaseUrl: vi.fn(),
  shouldUseMockClient: vi.fn(),
}));

describe("createClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return mock client when shouldUseMockClient is true", () => {
    const mockClientInstance = { mock: "client" };
    vi.mocked(shouldUseMockClient).mockReturnValue(true);
    vi.mocked(getMockSupabaseClient).mockReturnValue(mockClientInstance as any);

    const client = createClient();

    expect(shouldUseMockClient).toHaveBeenCalled();
    expect(getMockSupabaseClient).toHaveBeenCalled();
    expect(client).toBe(mockClientInstance);
    expect(createBrowserClient).not.toHaveBeenCalled();
  });

  it("should return browser client when shouldUseMockClient is false", () => {
    const browserClientInstance = { browser: "client" };
    const mockUrl = "https://mock.supabase.co";
    const mockKey = "mock-key";

    vi.mocked(shouldUseMockClient).mockReturnValue(false);
    vi.mocked(getSupabaseUrl).mockReturnValue(mockUrl);
    vi.mocked(getSupabaseAnonKey).mockReturnValue(mockKey);
    vi.mocked(createBrowserClient).mockReturnValue(browserClientInstance as any);

    const client = createClient();

    expect(shouldUseMockClient).toHaveBeenCalled();
    expect(getSupabaseUrl).toHaveBeenCalled();
    expect(getSupabaseAnonKey).toHaveBeenCalled();
    expect(createBrowserClient).toHaveBeenCalledWith(mockUrl, mockKey);
    expect(client).toBe(browserClientInstance);
    expect(getMockSupabaseClient).not.toHaveBeenCalled();
  });
});
