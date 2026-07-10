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
  // If request has a Next.js IP property natively, use it
  if ("ip" in request && typeof request.ip === "string") {
    return request.ip;
  }

  // Netlify provides a trusted client IP header that cannot be spoofed (it overwrites it)
  const netlifyIp = request.headers.get("x-nf-client-connection-ip");
  if (netlifyIp) {
    return netlifyIp.trim();
  }

  // To prevent IP spoofing, we take the *last* IP from x-forwarded-for,
  // which represents the IP that connected to the last trusted proxy.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const lastIp = ips[ips.length - 1].trim();
    if (lastIp) return lastIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
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
