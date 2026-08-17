/** Allow only same-origin relative paths to prevent open redirects. */
export function sanitizeRedirectPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path) return fallback;
  // Reject protocol-relative URLs, backslash-prefixed URLs, and any path
  // containing CRLF characters (or their encoded forms) to prevent header
  // injection and open redirect attacks.
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (/[\r\n]/.test(path) || /%0d|%0a/i.test(path)) return fallback;
  return path;
}
