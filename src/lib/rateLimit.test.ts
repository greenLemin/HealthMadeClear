import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, clearRateLimitStore } from "./rateLimit";

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
