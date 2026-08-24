import { checkRateLimit, clearRateLimitStore } from "./rateLimit";

/**
 * Optional distributed rate limiting. Local/serverless dev uses the in-memory
 * token bucket in `rateLimit.ts` (resets on cold start). When UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN are set, the same limits are enforced against
 * Upstash Redis so they survive cold starts and scale across invocations.
 *
 * Always falls back to the in-memory limiter on any Upstash error or when
 * unconfigured, so the endpoint stays available.
 */

export function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export function isUpstashConfigured(): boolean {
  return getUpstashConfig() !== null;
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds?: number };

async function upstashCheck(
  namespace: string,
  ip: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const config = getUpstashConfig();
  if (!config) throw new Error("Upstash not configured");

  const key = `ratelimit:${namespace}:${ip}`;
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const base = config.url.replace(/\/+$/, "");
  const headers = {
    Authorization: `Bearer ${config.token}`,
    "Content-Type": "application/json",
  };

  const resp = await fetch(`${base}/pipeline`, {
    method: "POST",
    headers,
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSec],
    ]),
  });
  if (!resp.ok) throw new Error(`Upstash pipeline failed with ${resp.status}`);

  const body = (await resp.json()) as unknown;
  const count = Number(Array.isArray(body) && Array.isArray(body[0]) ? body[0][0]?.result : NaN);
  if (Number.isNaN(count)) throw new Error("Upstash returned unexpected shape");

  if (count <= maxRequests) return { allowed: true };

  // Blocked — resolve remaining TTL for the retry-after header.
  let retryAfterSeconds = windowSec;
  try {
    const ttlResp = await fetch(`${base}/pttl`, {
      method: "POST",
      headers,
      body: JSON.stringify([key]),
    });
    if (ttlResp.ok) {
      const ttlBody = (await ttlResp.json()) as unknown;
      const ttl = Number(Array.isArray(ttlBody) && Array.isArray(ttlBody[0]) ? ttlBody[0][0]?.result : NaN);
      if (!Number.isNaN(ttl) && ttl > 0) retryAfterSeconds = Math.ceil(ttl / 1000);
    }
  } catch {
    // TTL read is best-effort; keep the window as the retry-after estimate.
  }

  return { allowed: false, retryAfterSeconds };
}

export async function checkRateLimitDistributed(
  namespace: string,
  ip: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!isUpstashConfigured()) {
    return mapLocal(checkRateLimit(namespace, ip, maxRequests, windowMs));
  }

  try {
    return await upstashCheck(namespace, ip, maxRequests, windowMs);
  } catch {
    // Fail-open to the in-memory limiter so a misconfigured or unreachable
    // Upstash store never takes the endpoint down.
    return mapLocal(checkRateLimit(namespace, ip, maxRequests, windowMs));
  }
}

function mapLocal(local: { allowed: boolean; retryAfterSeconds?: number }): RateLimitResult {
  return local.allowed ? { allowed: true } : { allowed: false, retryAfterSeconds: local.retryAfterSeconds };
}
