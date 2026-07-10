import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportServerError } from "@/lib/errorReporting";
import { clearRateLimitStore } from "@/lib/rateLimit";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/errorReporting", () => ({
  reportServerError: vi.fn(),
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimitStore("auth-callback");
  });

  it("reports error when exchangeCodeForSession throws", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockRejectedValue(new Error("Network Error")),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const req = new NextRequest("http://localhost/auth/callback?code=some_code");

    const res = await GET(req);

    expect(reportServerError).toHaveBeenCalledWith(expect.any(Error), { route: "auth/callback" });
    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/auth/login?error=auth_failed");
  });

  it("redirects to next param on success", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const req = new NextRequest("http://localhost/auth/callback?code=some_code&next=/dashboard");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/dashboard");
  });

  it("redirects to login with error when exchangeCodeForSession returns an error", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: { message: "Invalid code" } }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const req = new NextRequest("http://localhost/auth/callback?code=some_code");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/auth/login?error=auth_failed");
  });

  it("redirects to error if no code provided", async () => {
    const req = new NextRequest("http://localhost/auth/callback");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/auth/login?error=auth_failed");
  });

  it("redirects with rate_limited error if rate limit exceeded", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    for (let i = 0; i < 5; i++) {
      const req = new NextRequest("http://localhost/auth/callback?code=code" + i, {
        headers: { "x-forwarded-for": "127.0.0.1" },
      });
      await GET(req);
    }

    const req = new NextRequest("http://localhost/auth/callback?code=too_many", {
      headers: { "x-forwarded-for": "127.0.0.1" },
    });
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("Location")).toContain("/auth/login?error=rate_limited");
  });
});
