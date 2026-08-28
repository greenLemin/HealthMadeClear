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

describe("updateSession middleware", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    (isSupabaseConfigured as any).mockReturnValue(true);
    (shouldUseMockClient as any).mockReturnValue(false);

    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    };
    (createServerClient as any).mockImplementation((_url: string, _key: string, options: any) => {
      mockSupabase._options = options;
      return mockSupabase;
    });
  });

  it("returns unchanged response when configured with mock client", async () => {
    (shouldUseMockClient as any).mockReturnValue(true);
    const req = new NextRequest("http://localhost:3000/");
    const res = await updateSession(req);
    expect(res).toBeDefined();
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users away from dashboard routes and copies cookies", async () => {
    const req = new NextRequest("http://localhost:3000/en/dashboard/settings");
    const incomingRes = NextResponse.next();
    incomingRes.cookies.set("custom-cookie", "custom-val");

    const res = await updateSession(req, incomingRes);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/en/auth/login?redirect=%2Fen%2Fdashboard%2Fsettings"
    );
    expect(res.cookies.get("custom-cookie")?.value).toBe("custom-val");
  });

  it("allows authenticated users to access dashboard routes", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "123" } }, error: null });
    const req = new NextRequest("http://localhost:3000/en/dashboard/settings");
    const res = await updateSession(req);
    expect(res.status).toBe(200);
  });

  it("expires sb- auth cookies on dashboard 307 when getUser resolves with an auth error", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid JWT token" },
    });

    const req = new NextRequest("http://localhost:3000/en/dashboard/settings", {
      headers: {
        cookie: "sb-project-auth-token=stale-jwt; sb-project-auth-token.0=chunk-0",
      },
    });

    const res = await updateSession(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/en/auth/login");
    // Check that sb- auth cookies were set with maxAge: 0
    expect(res.cookies.get("sb-project-auth-token")?.value).toBe("");
    expect(res.cookies.get("sb-project-auth-token.0")?.value).toBe("");
  });

  it("expires sb- auth cookies on 200 public route when getUser resolves with an auth error", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" },
    });

    const req = new NextRequest("http://localhost:3000/en/learn", {
      headers: {
        cookie: "sb-project-auth-token=stale-jwt",
      },
    });

    const res = await updateSession(req);
    expect(res.status).toBe(200);
    expect(res.cookies.get("sb-project-auth-token")?.value).toBe("");
  });

  it("does not expire cookies on public route when there are no auth cookies and user is null", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const req = new NextRequest("http://localhost:3000/en/learn");
    const res = await updateSession(req);
    expect(res.status).toBe(200);
    expect(res.cookies.get("sb-project-auth-token")).toBeUndefined();
  });

  it("does not expire cookies when getUser throws (outage), keeping cookies on public route", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("Supabase service unavailable"));

    const req = new NextRequest("http://localhost:3000/en/learn", {
      headers: {
        cookie: "sb-project-auth-token=valid-jwt",
      },
    });

    const res = await updateSession(req);
    expect(res.status).toBe(200);
    expect(res.cookies.get("sb-project-auth-token")).toBeUndefined(); // Not set to maxAge=0
  });

  it("copies cookies without expiring on dashboard 307 when getUser throws (outage)", async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error("Supabase connection timeout"));

    const req = new NextRequest("http://localhost:3000/en/dashboard", {
      headers: {
        cookie: "sb-project-auth-token=valid-jwt",
      },
    });
    const incomingRes = NextResponse.next();
    incomingRes.cookies.set("sb-project-auth-token", "valid-jwt");

    const res = await updateSession(req, incomingRes);
    expect(res.status).toBe(307);
    expect(res.cookies.get("sb-project-auth-token")?.value).toBe("valid-jwt");
  });

  it("setAll preserves response headers (like x-middleware-rewrite) and existing cookies on 2xx (CF-48)", async () => {
    const req = new NextRequest("http://localhost:3000/en/learn");
    const incomingRes = NextResponse.next({
      headers: {
        "x-middleware-rewrite": "http://localhost:3000/en/learn",
        "x-next-intl-locale": "en",
      },
    });
    incomingRes.cookies.set("NEXT_LOCALE", "en");

    (createServerClient as any).mockImplementation((_url: string, _key: string, options: any) => {
      // Simulate Supabase refresh writing cookies via setAll
      options.cookies.setAll([{ name: "sb-token", value: "new-jwt", options: { path: "/" } }]);
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
        },
      };
    });

    const res = await updateSession(req, incomingRes);
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/en/learn");
    expect(res.headers.get("x-next-intl-locale")).toBe("en");
    expect(res.cookies.get("NEXT_LOCALE")?.value).toBe("en");
    expect(res.cookies.get("sb-token")?.value).toBe("new-jwt");
  });

  it("setAll sets cookies directly on 3xx redirect response without calling NextResponse.next, and mutates request.cookies", async () => {
    const req = new NextRequest("http://localhost:3000/en/old-path");
    const redirectRes = NextResponse.redirect(new URL("/en/new-path", req.url), 307);

    (createServerClient as any).mockImplementation((_url: string, _key: string, options: any) => {
      options.cookies.setAll([
        { name: "sb-refreshed-token", value: "token-value-refreshed", options: { path: "/" } },
      ]);
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
        },
      };
    });

    const res = await updateSession(req, redirectRes);
    expect(res.status).toBe(307);
    expect(res.cookies.get("sb-refreshed-token")?.value).toBe("token-value-refreshed");
    expect(req.cookies.get("sb-refreshed-token")?.value).toBe("token-value-refreshed");
  });
});
