type RateLimitRecord = { count: number; resetAt: number };

const STORE_CAP = 5000;
const stores = new Map<string, Map<string, RateLimitRecord>>();

function evictOldestUntilUnderCap(store: Map<string, RateLimitRecord>) {
  // Map preserves insertion order, so the first key is the oldest inserted.
  // Previous implementation scanned the entire map for the smallest resetAt on
  // every eviction (O(n) per eviction, O(n²) when filling), which is wasteful
  // on a hot path. Insertion-order eviction is O(1) per eviction and sufficient
  // for a bounded in-memory best-effort limiter (resets on cold start anyway).
  while (store.size >= STORE_CAP) {
    const oldestKey = store.keys().next().value as string | undefined;
    if (oldestKey === undefined) break;
    store.delete(oldestKey);
  }
}

function getStore(namespace: string) {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]+$/;

function normalizeIp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().slice(0, 45);
  if (!trimmed) return null;
  if (IPV4_RE.test(trimmed) || IPV6_RE.test(trimmed)) return trimmed;
  return null;
}

export function getClientIp(request: Request): string {
  // Use the native Next.js IP property if available
  if ("ip" in request && typeof request.ip === "string") {
    return normalizeIp(request.ip) ?? "unknown";
  }

  // Netlify provides a trusted client IP header that cannot be spoofed — the
  // edge overwrites x-nf-client-connection-ip, so clients cannot inject it.
  // Trust model: when this header is present, it is the authoritative client
  // IP and we use it exclusively without falling back to XFF.
  const netlifyIp = normalizeIp(request.headers.get("x-nf-client-connection-ip"));
  if (netlifyIp) return netlifyIp;

  // To prevent IP spoofing, we take the *last* IP from x-forwarded-for,
  // which represents the IP that connected to the last trusted proxy.
  // Trust model: assumes request traversed a trusted proxy (Netlify/Vercel)
  // that appends the real client address. The first entry can be spoofed by
  // the client; the last entry is supplied by the trusted proxy and is
  // therefore the only XFF entry we trust under this model.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    const lastIp = normalizeIp(ips[ips.length - 1]);
    if (lastIp) return lastIp;
  }

  // x-real-ip is client-controllable — only accept it when it looks like an
  // IP; otherwise fall through to the shared unknown bucket rather than
  // letting an attacker create unbounded rate-limit buckets.
  const realIp = normalizeIp(request.headers.get("x-real-ip"));
  if (realIp) return realIp;

  // Distinct bucket for missing IP — avoids collapsing all unknown clients
  // onto 127.0.0.1 and makes the rate-limit bucket explicit. Callers get a
  // shared "unknown" bucket rather than a loopback bucket that could mask
  // localhost traffic.
  return "unknown";
}

type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** In-memory per-IP rate limit. Resets on serverless cold start — see DEPLOYMENT.md. */
export function checkRateLimit(
  namespace: string,
  ip: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const store = getStore(namespace);
  const now = Date.now();

  // Lazy expiry: only check the accessed bucket instead of sweeping the entire
  // store (previous O(n) sweep on every request, up to STORE_CAP=5000 entries).
  // Expired entries for other IPs are reclaimed opportunistically on insert
  // via insertion-order eviction, which keeps steady-state cost O(1).
  const existing = store.get(ip);
  if (existing && now >= existing.resetAt) {
    store.delete(ip);
  }

  const record = store.get(ip);

  if (record && now < record.resetAt) {
    if (record.count >= maxRequests) {
      return { allowed: false, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
    }
    record.count += 1;
    return { allowed: true };
  }

  evictOldestUntilUnderCap(store);
  store.set(ip, { count: 1, resetAt: now + windowMs });
  return { allowed: true };
}

export function getRateLimitStoreSize(namespace: string): number {
  return stores.get(namespace)?.size ?? 0;
}

export function clearRateLimitStore(namespace?: string) {
  if (namespace) {
    stores.get(namespace)?.clear();
    return;
  }
  stores.clear();
}
