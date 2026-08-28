import { describe, expect, it, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { clearRateLimitStore } from "@/lib/rateLimit";
import * as serverLib from "@/lib/supabase/server";
import * as errorReportingLib from "@/lib/errorReporting";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/errorReporting", () => ({
  reportServerError: vi.fn(),
}));

function confirmRequest(path: string, headers?: HeadersInit) {
  return new NextRequest(`http://localhost${path}`, headers ? { headers } : undefined);
}

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearRateLimitStore("auth-callback");
  });

  it("redirects to rate_limited if rate limit is exceeded", async () => {
    const ip = "127.0.0.1";
    for (let i = 0; i < 5; i++) {
      await GET(confirmRequest("/auth/confirm", { "x-forwarded-for": ip }));
    }
    const res = await GET(confirmRequest("/auth/confirm", { "x-forwarded-for": ip }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=rate_limited");
  });

  it("redirects to confirmation_failed if no code is provided", async () => {
    const res = await GET(confirmRequest("/auth/confirm"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=confirmation_failed");
  });

  it("keeps locale on confirmation_failed for /es/auth/confirm with no code", async () => {
    const res = await GET(confirmRequest("/es/auth/confirm"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/es/auth/login?error=confirmation_failed");
  });

  it("redirects to next URL on successful confirmation", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
        verifyOtp: vi.fn(),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as never);

    const res = await GET(confirmRequest("/auth/confirm?code=123&next=/dashboard"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/dashboard");
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("123");
  });

  it("redirects to confirmation_failed if exchangeCodeForSession returns an error", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: new Error("invalid code") }),
        verifyOtp: vi.fn(),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as never);

    const res = await GET(confirmRequest("/auth/confirm?code=123"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=confirmation_failed");
  });

  it("reports server error and redirects to confirmation_failed on unexpected exception", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn().mockRejectedValue(new Error("unexpected error")),
        verifyOtp: vi.fn(),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as never);

    const res = await GET(confirmRequest("/auth/confirm?code=123"));

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("error=confirmation_failed");
    expect(errorReportingLib.reportServerError).toHaveBeenCalledWith(expect.any(Error), {
      route: "auth/confirm",
    });
  });

  it("calls verifyOtp for token_hash + type=signup and redirects to next", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn(),
        verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as never);

    const res = await GET(confirmRequest("/es/auth/confirm?token_hash=h&type=signup&next=/es/dashboard"));

    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "h", type: "signup" });
    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/es/dashboard");
  });

  it("forces reset-password when type=recovery even if next is dashboard", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn(),
        verifyOtp: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as never);

    const res = await GET(confirmRequest("/es/auth/confirm?token_hash=h&type=recovery&next=/es/dashboard"));

    expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "h", type: "recovery" });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/es/auth/reset-password");
  });

  it("fails when type is not allowlisted", async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: vi.fn(),
        verifyOtp: vi.fn(),
      },
    };
    vi.mocked(serverLib.createClient).mockResolvedValue(mockSupabase as never);

    const res = await GET(confirmRequest("/es/auth/confirm?token_hash=h&type=not-a-type"));

    expect(mockSupabase.auth.verifyOtp).not.toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost/es/auth/login?error=confirmation_failed");
  });
});
