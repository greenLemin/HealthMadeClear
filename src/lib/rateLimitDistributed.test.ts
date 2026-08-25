import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearRateLimitStore } from "./rateLimit";
import { checkRateLimitDistributed, getUpstashConfig, isUpstashConfigured } from "./rateLimitDistributed";

describe("rateLimitDistributed", () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    clearRateLimitStore();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    clearRateLimitStore();
  });

  it("reports unconfigured when env vars are missing", () => {
    expect(isUpstashConfigured()).toBe(false);
    expect(getUpstashConfig()).toBeNull();
  });

  it("detects configuration when both env vars are present", () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    expect(isUpstashConfigured()).toBe(true);
    expect(getUpstashConfig()).toEqual({ url: "https://xx.upstash.io", token: "secret" });
  });

  it("uses the in-memory limiter when Upstash is not configured", async () => {
    const limit1 = await checkRateLimitDistributed("t", "1.2.3.4", 2, 60_000);
    expect(limit1.allowed).toBe(true);
    const limit2 = await checkRateLimitDistributed("t", "1.2.3.4", 2, 60_000);
    expect(limit2.allowed).toBe(true);
    const limit3 = await checkRateLimitDistributed("t", "1.2.3.4", 2, 60_000);
    expect(limit3.allowed).toBe(false);
    expect(limit3.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("fails open to the memory limiter when Upstash fetch rejects", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const limit = await checkRateLimitDistributed("t", "10.0.0.1", 1, 60_000);
    expect(limit.allowed).toBe(true);
    // Same IP still respects the same in-memory budget.
    const second = await checkRateLimitDistributed("t", "10.0.0.1", 1, 60_000);
    expect(second.allowed).toBe(false);
  });

  it("fails open to the memory limiter when Upstash pipeline returns non-OK status", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    const limit = await checkRateLimitDistributed("t", "10.0.0.5", 1, 60_000);
    expect(limit.allowed).toBe(true);
  });

  it("fails open to the memory limiter when Upstash pipeline returns unexpected JSON shape", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ error: "invalid pipeline" }),
      })
    );

    const limit = await checkRateLimitDistributed("t", "10.0.0.6", 1, 60_000);
    expect(limit.allowed).toBe(true);
  });

  it("parses a normal Upstash pipeline response as allowed", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [[{ result: 1 }, { result: 1 }]],
      })
    );

    const limit = await checkRateLimitDistributed("t", "10.0.0.2", 5, 60_000);
    expect(limit.allowed).toBe(true);
  });

  it("reports blocked with TTL when the count exceeds the budget", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ result: 9 }, { result: 1 }]],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ result: 45000 }]],
      });
    vi.stubGlobal("fetch", fetchMock);

    const limit = await checkRateLimitDistributed("t", "10.0.0.3", 5, 60_000);
    expect(limit.allowed).toBe(false);
    expect(limit.retryAfterSeconds).toBe(45);
  });

  it("falls back to the window when the TTL response is unusable", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ result: 6 }, { result: 1 }]],
      })
      .mockRejectedValueOnce(new Error("ttl failed"));
    vi.stubGlobal("fetch", fetchMock);

    const limit = await checkRateLimitDistributed("t", "10.0.0.4", 5, 60_000);
    expect(limit.allowed).toBe(false);
    expect(limit.retryAfterSeconds).toBe(60);
  });

  it("falls back to window when TTL response returns non-OK status", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ result: 10 }, { result: 1 }]],
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
    vi.stubGlobal("fetch", fetchMock);

    const limit = await checkRateLimitDistributed("t", "10.0.0.7", 5, 60_000);
    expect(limit.allowed).toBe(false);
    expect(limit.retryAfterSeconds).toBe(60);
  });

  it("falls back to window when TTL response returns invalid or non-positive TTL", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ result: 10 }, { result: 1 }]],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[{ result: -2 }]],
      });
    vi.stubGlobal("fetch", fetchMock);

    const limit = await checkRateLimitDistributed("t", "10.0.0.8", 5, 60_000);
    expect(limit.allowed).toBe(false);
    expect(limit.retryAfterSeconds).toBe(60);
  });

  it("strips trailing slashes from UPSTASH_REDIS_REST_URL", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io///");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [[{ result: 1 }, { result: 1 }]],
    });
    vi.stubGlobal("fetch", fetchMock);

    await checkRateLimitDistributed("t", "10.0.0.9", 5, 60_000);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://xx.upstash.io/pipeline",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("clamps windowSec to a minimum of 1 second for sub-second windowMs", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://xx.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "secret");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [[{ result: 1 }, { result: 1 }]],
    });
    vi.stubGlobal("fetch", fetchMock);

    await checkRateLimitDistributed("t", "10.0.0.10", 5, 500);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://xx.upstash.io/pipeline",
      expect.objectContaining({
        body: JSON.stringify([
          ["INCR", "ratelimit:t:10.0.0.10"],
          ["EXPIRE", "ratelimit:t:10.0.0.10", 1],
        ]),
      })
    );
  });
});
