import { describe, expect, it, vi, beforeEach } from "vitest";
import { POST, clearRateLimitStore } from "./route";

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test_service_key");
    clearRateLimitStore("contact");
  });

  it("returns 400 for missing fields", async () => {
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "A" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "bad", message: "Hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("silently accepts honeypot submissions", async () => {
    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Bot",
        email: "bot@spam.com",
        message: "spam",
        website: "filled",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it("enforces rate limits after 5 submissions", async () => {
    const ip = "192.168.1.99";

    const promises = Array.from({ length: 5 }, () => {
      const req = new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Hi" }),
      });
      return POST(req);
    });

    const responses = await Promise.all(promises);
    for (const res of responses) {
      expect(res.status).not.toBe(429);
    }

    const req6 = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "x-forwarded-for": ip,
      },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Hi" }),
    });
    const res6 = await POST(req6);
    expect(res6.status).toBe(429);
    const json = await res6.json();
    expect(json.error).toContain("Too many requests");

    const reqOther = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "x-forwarded-for": "192.168.1.100",
      },
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Hi" }),
    });
    const resOther = await POST(reqOther);
    expect(resOther.status).not.toBe(429);
  });

  it("returns 503 when Supabase env is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "Alice", email: "alice@example.com", message: "Hi" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(503);
  });
});
