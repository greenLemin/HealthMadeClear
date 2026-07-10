import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { clearRateLimitStore } from "@/lib/rateLimit";
import * as serverLib from "@/lib/supabase/server";
import * as errorReportingLib from "@/lib/errorReporting";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/errorReporting", () => ({
  reportServerError: vi.fn(),
}));

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimitStore("auth-callback");
  });

  it("redirects to rate_limited if rate limit is exceeded", async () => {
    const ip = "127.0.0.1";
    for (let i = 0; i < 5; i++) {
      const req = new Request("http://localhost/auth/confirm", {
        headers: { "x-forwarded-for": ip },
      });
      await GET(req as any);
    }
    const req = new Request("http://localhost/auth/confirm", {
      headers: { "x-forwarded-for": ip },
    });
    const res = await GET(req as any);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=rate_limited");
  });

  it("redirects to confirmation_failed if no code is provided", async () => {
    const req = new Request("http://localhost/auth/confirm");
    const res = await GET(req as any);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=confirmation_failed");
  });

  it("redirects to next URL on successful confirmation", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as any);

    const req = new Request("http://localhost/auth/confirm?code=123&next=/dashboard");
    const res = await GET(req as any);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("123");
  });

  it("redirects to confirmation_failed if exchangeCodeForSession returns an error", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: new Error("invalid code") }),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as any);

    const req = new Request("http://localhost/auth/confirm?code=123");
    const res = await GET(req as any);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=confirmation_failed");
  });

  it("reports server error and redirects to confirmation_failed on unexpected exception", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockRejectedValue(new Error("unexpected error")),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as any);

    const req = new Request("http://localhost/auth/confirm?code=123");
    const res = await GET(req as any);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=confirmation_failed");
    expect(errorReportingLib.reportServerError).toHaveBeenCalledWith(expect.any(Error), {
      route: "auth/confirm",
    });
  });
});
