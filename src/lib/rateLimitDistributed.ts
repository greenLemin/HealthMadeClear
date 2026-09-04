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

  // Fixed window: only set expiry on the first hit in a window. The previous
  // pipeline ran EXPIRE on every request, sliding the window forward and
  // letting a steady 1-req-per-second client stay under the limit forever.
  const resp = await fetch(`${base}/incr/${key}`, {
    method: "POST",
    headers,
    signal: AbortSignal.timeout(2000),
  });
  if (!resp.ok) throw new Error(`Upstash incr failed with ${resp.status}`);

  const body = (await resp.json()) as unknown;
  const count = Number(
    (body as { result?: unknown })?.result ??
      (Array.isArray(body) ? (body[0] as { result?: unknown })?.result : NaN)
  );
  if (Number.isNaN(count)) throw new Error("Upstash returned unexpected shape");

  if (count === 1) {
    // First hit — arm the window. Best-effort; if this fails the key will be
    // reaped by the next cold path via fail-open in-memory limiter.
    await fetch(`${base}/expire/${key}/${windowSec}`, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }

  if (count <= maxRequests) return { allowed: true };

  // Blocked — resolve remaining TTL for the retry-after header.
  let retryAfterSeconds = windowSec;
  try {
    const ttlResp = await fetch(`${base}/ttl/${key}`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(2000),
    });
    if (ttlResp.ok) {
      const ttlBody = (await ttlResp.json()) as unknown;
      const ttl = Number(
        (ttlBody as { result?: unknown })?.result ??
          (Array.isArray(ttlBody) ? (ttlBody[0] as { result?: unknown })?.result : NaN)
      );
      if (!Number.isNaN(ttl) && ttl > 0) retryAfterSeconds = ttl;
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
