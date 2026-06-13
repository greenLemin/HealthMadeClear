/** Allow only same-origin relative paths to prevent open redirects. */
export function sanitizeRedirectPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
