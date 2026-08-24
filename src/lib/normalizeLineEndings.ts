/** Normalize Windows CRLF to LF so bundled content is stable across platforms. */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\uFEFF/g, "").replace(/\r\n|\r/g, "\n");
}
