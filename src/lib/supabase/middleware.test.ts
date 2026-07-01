import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateSession } from "./middleware";
import { isSupabaseConfigured, shouldUseMockClient } from "./env";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

vi.mock("./env", () => ({
  isSupabaseConfigured: vi.fn(),
  shouldUseMockClient: vi.fn(),
  getSupabaseUrl: vi.fn(),
  getSupabaseAnonKey: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

describe("updateSession", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (isSupabaseConfigured as any).mockReturnValue(true);
    (shouldUseMockClient as any).mockReturnValue(false);

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    };
    (createServerClient as any).mockReturnValue(mockSupabase);
  });

  it("should return unchanged response when configured with mock client", async () => {
    (shouldUseMockClient as any).mockReturnValue(true);
    const req = new NextRequest("http://localhost:3000/");
    const res = await updateSession(req);
    expect(res).toBeDefined();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("should redirect unauthenticated users away from dashboard routes", async () => {
    const req = new NextRequest("http://localhost:3000/en/dashboard/settings");
    const res = await updateSession(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/en/auth/login?redirect=%2Fen%2Fdashboard%2Fsettings"
    );
  });

  it("should allow authenticated users to access dashboard routes", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "123" } } });
    const req = new NextRequest("http://localhost:3000/en/dashboard/settings");
    const res = await updateSession(req);
    expect(res.status).toBe(200);
  });

  it("should allow unauthenticated users to access non-dashboard routes", async () => {
    const req = new NextRequest("http://localhost:3000/en/public");
    const res = await updateSession(req);
    expect(res.status).toBe(200);
  });

  it("should handle custom response input", async () => {
    const req = new NextRequest("http://localhost:3000/en/public");
    const customRes = NextResponse.next();
    customRes.headers.set("X-Custom", "123");

    const res = await updateSession(req, customRes);
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Custom")).toBe("123");
  });
  it("should handle cookie getAll and setAll from createServerClient", async () => {
    const req = new NextRequest("http://localhost:3000/en/public");

    // Test getAll
    let mockCookies = [{ name: "test-cookie", value: "test-value" }];
    Object.defineProperty(req, "cookies", {
      value: {
        getAll: vi.fn(() => mockCookies),
        set: vi.fn((name, value) => {
          mockCookies.push({ name, value });
        }),
      },
      writable: true,
    });

    await updateSession(req);
    const options = (createServerClient as any).mock.calls[0][2];
    const allCookies = options.cookies.getAll();
    expect(allCookies).toEqual([{ name: "test-cookie", value: "test-value" }]);

    // Test setAll
    const cookiesToSet = [
      { name: "new-cookie", value: "new-value", options: { path: "/" } },
      { name: "test-cookie", value: "updated-value", options: { path: "/" } },
    ];

    options.cookies.setAll(cookiesToSet);

    // mockCookies should be updated
    expect(mockCookies).toContainEqual({ name: "new-cookie", value: "new-value" });
    expect(mockCookies).toContainEqual({ name: "test-cookie", value: "updated-value" });
  });
});
