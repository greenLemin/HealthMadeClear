/** Allow only same-origin relative paths to prevent open redirects. */
export function sanitizeRedirectPath(path: string | null | undefined, fallback = "/dashboard"): string {
  if (!path) return fallback;
  // Reject null bytes or control characters in raw input (%00, \0, \x00-\x1f, \x7f-\x9f)
  if (/[\x00-\x1F\x7F-\x9F]/.test(path) || /%00/i.test(path)) return fallback;
  let decoded: string;
  try {
    decoded = decodeURIComponent(path);
  } catch {
    return fallback;
  }
  decoded = decoded.trim();
  // Reject null bytes or control characters after decoding
  if (/[\x00-\x1F\x7F-\x9F]/.test(decoded)) return fallback;
  // Operate on decoded+trimmed value to catch encoded bypasses (e.g. %2F, %5C, %2E)
  if (!decoded.startsWith("/") || decoded.startsWith("//") || decoded.startsWith("/\\")) return fallback;
  // CRLF injection (decoded and encoded forms)
  if (/[\r\n]/.test(decoded) || /%0d|%0a/i.test(path) || /%0d|%0a/i.test(decoded)) return fallback;
  // Block whitespace after decoding (space, tab, etc.) — prevents "/ /evil" bypass
  if (/\s/.test(decoded)) return fallback;
  // Block encoded variants that survive single decode (double-encoding) and traversal
  if (/%2f|%5c|%2e/i.test(decoded)) return fallback;
  // Defense-in-depth: block original containing encoded slash/backslash
  if (/%2f|%5c/i.test(path)) return fallback;
  // Encoded dot only matters for traversal — block if decoded contains dot traversal
  if (/%2e/i.test(path) && decoded.includes("..")) return fallback;
  // Path traversal via .. or backslash
  if (decoded.includes("..") || decoded.includes("\\") || decoded.includes("/..")) return fallback;
  if (decoded.split("/").includes("..")) return fallback;
  return decoded;
}
