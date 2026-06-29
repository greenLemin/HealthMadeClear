type RateLimitRecord = { count: number; resetAt: number };

const stores = new Map<string, Map<string, RateLimitRecord>>();

function getStore(namespace: string) {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "127.0.0.1"
  );
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** In-memory per-IP rate limit. Resets on serverless cold start — see DEPLOYMENT.md. */
export function checkRateLimit(
  namespace: string,
  ip: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(namespace);
  const now = Date.now();

  for (const [key, value] of store.entries()) {
    if (now >= value.resetAt) store.delete(key);
  }

  const record = store.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
    }
    record.count += 1;
    return { allowed: true };
  }

  store.set(ip, { count: 1, resetAt: now + windowMs });
  return { allowed: true };
}

export function clearRateLimitStore(namespace?: string) {
  if (namespace) {
    stores.get(namespace)?.clear();
    return;
  }
  stores.clear();
}
