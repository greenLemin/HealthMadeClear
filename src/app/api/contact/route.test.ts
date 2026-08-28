import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { clearRateLimitStore } from "@/lib/rateLimit";
import { reportServerError } from "@/lib/errorReporting";

vi.mock("@/lib/errorReporting", () => ({
  reportServerError: vi.fn(),
}));

function makeRequest(body: Record<string, unknown>, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { origin: "http://localhost:3000", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test_service_key");
    clearRateLimitStore("contact");
    vi.mocked(reportServerError).mockClear();
  });

  it("returns 400 for missing fields", async () => {
    const res = await POST(makeRequest({ name: "A" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "bad", message: "Hi" }));
    expect(res.status).toBe(400);
  });

  it("silently accepts honeypot submissions", async () => {
    const res = await POST(
      makeRequest({
        name: "Bot",
        email: "bot@spam.com",
        message: "spam",
        website: "filled",
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("returns 403 for missing Origin header (CSRF)", async () => {
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 403 for mismatched Origin (CSRF)", async () => {
    const res = await POST(
      makeRequest(
        { name: "Alice", email: "alice@example.com", message: "Hi" },
        { origin: "https://evil.example.com" }
      )
    );
    expect(res.status).toBe(403);
  });

  it("enforces rate limits after 5 submissions", async () => {
    const ip = "192.168.1.99";

    const promises = Array.from({ length: 5 }, () =>
      POST(
        makeRequest({ name: "Alice", email: "alice@example.com", message: "Hi" }, { "x-forwarded-for": ip })
      )
    );

    const responses = await Promise.all(promises);
    for (const res of responses) {
      expect(res.status).not.toBe(429);
    }

    const res6 = await POST(
      makeRequest({ name: "Alice", email: "alice@example.com", message: "Hi" }, { "x-forwarded-for": ip })
    );
    expect(res6.status).toBe(429);
    const json = await res6.json();
    expect(json.error).toContain("Too many requests");

    const resOther = await POST(
      makeRequest(
        { name: "Alice", email: "alice@example.com", message: "Hi" },
        { "x-forwarded-for": "192.168.1.100" }
      )
    );
    expect(resOther.status).not.toBe(429);
  });

  it("returns 503 when Supabase env is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const res = await POST(makeRequest({ name: "Alice", email: "alice@example.com", message: "Hi" }));
    expect(res.status).toBe(503);
  });

  it("returns 400 for invalid field types", async () => {
    const res = await POST(makeRequest({ name: 123, email: "test@example.com", message: "Hi" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for name exceeding length limit", async () => {
    const res = await POST(makeRequest({ name: "A".repeat(101), email: "test@example.com", message: "Hi" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for email exceeding length limit", async () => {
    const res = await POST(
      makeRequest({ name: "Alice", email: "A".repeat(201) + "@test.com", message: "Hi" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for message exceeding length limit", async () => {
    const res = await POST(
      makeRequest({ name: "Alice", email: "test@example.com", message: "A".repeat(5001) })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for subject exceeding length limit", async () => {
    const res = await POST(
      makeRequest({
        name: "Alice",
        email: "test@example.com",
        message: "Hi",
        subject: "A".repeat(101),
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for empty POST with no body and does not reportServerError", async () => {
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(reportServerError).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON and does not reportServerError", async () => {
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "application/json" },
      body: "{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(reportServerError).not.toHaveBeenCalled();
  });

  it("returns 413 for Content-Length over 10KB without reading the body", async () => {
    const getReader = vi.fn(() => {
      throw new Error("should not read body");
    });
    const req = {
      url: "http://localhost/api/contact",
      headers: new Headers({ origin: "http://localhost:3000", "content-length": "20000" }),
      body: { getReader },
    } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(413);
    expect(getReader).not.toHaveBeenCalled();
    expect(reportServerError).not.toHaveBeenCalled();
  });

  it("returns 413 for an oversized stream without Content-Length and cancels the reader", async () => {
    let cancelled = false;
    let index = 0;
    const chunk = new Uint8Array(10241);
    const req = {
      url: "http://localhost/api/contact",
      headers: new Headers({ origin: "http://localhost:3000" }),
      body: {
        getReader() {
          return {
            async read() {
              if (index > 0) return { done: true as const, value: undefined };
              index += 1;
              return { done: false as const, value: chunk };
            },
            async cancel() {
              cancelled = true;
            },
            releaseLock() {},
          };
        },
      },
    } as unknown as Request;
    const res = await POST(req);
    expect(res.status).toBe(413);
    expect(cancelled).toBe(true);
    expect(reportServerError).not.toHaveBeenCalled();
  });
});
