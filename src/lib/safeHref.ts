const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Content authors write Markdown, so link targets are attacker-controlled if a
 * content file is ever compromised. Only allow a fixed set of protocols, and
 * resolve relative links against a dummy origin so anchors and site-relative
 * paths keep working.
 *
 * Control characters are stripped first: `java\0script:` and friends are
 * ignored by browsers when resolving a URL, so they must not survive into the
 * protocol check.
 */
export function isSafeHref(href: string): boolean {
  // markdown-it percent-encodes control characters and spaces before we ever
  // see the href, so `java\0script:` arrives as `java%00script:`. Decode first,
  // then strip, so those payloads cannot smuggle a scheme past the check.
  let decoded = href;
  try {
    decoded = decodeURIComponent(href);
  } catch {
    // Malformed escape sequence — fall through and test the raw value.
  }
  const normalized = decoded.replace(/[\u0000-\u0020\u007F-\u009F]/g, "");
  if (normalized === "") return false;
  try {
    return SAFE_PROTOCOLS.has(new URL(normalized, "https://example.invalid").protocol);
  } catch {
    return false;
  }
}
