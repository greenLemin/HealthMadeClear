import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, clearRateLimitStore, getClientIp } from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("allows requests under the limit", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("test", ip, 5, 60_000)).toEqual({ allowed: true });
    }
  });

  it("blocks requests over the limit", () => {
    const ip = "10.0.0.2";
    for (let i = 0; i < 5; i++) {
      checkRateLimit("test", ip, 5, 60_000);
    }
    const blocked = checkRateLimit("test", ip, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("isolates namespaces", () => {
    const ip = "10.0.0.3";
    for (let i = 0; i < 5; i++) {
      checkRateLimit("a", ip, 5, 60_000);
    }
    expect(checkRateLimit("b", ip, 5, 60_000)).toEqual({ allowed: true });
  });
});

describe("getClientIp", () => {
  it("uses the Next.js native ip property if present", () => {
    const req = new Request("http://localhost");
    (req as any).ip = "203.0.113.1";
    expect(getClientIp(req)).toBe("203.0.113.1");
  });

  it("extracts IP from x-nf-client-connection-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-nf-client-connection-ip": "192.168.1.1" },
    });
    expect(getClientIp(req)).toBe("192.168.1.1");
  });

  it("extracts the last IP from x-forwarded-for to prevent spoofing", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2, 192.168.1.2" },
    });
    expect(getClientIp(req)).toBe("192.168.1.2");
  });

  it("falls back to x-real-ip if x-forwarded-for is missing", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "192.168.1.3" },
    });
    expect(getClientIp(req)).toBe("192.168.1.3");
  });

  it("returns 127.0.0.1 as a last resort", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
