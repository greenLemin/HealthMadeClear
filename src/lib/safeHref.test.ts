import { describe, expect, it } from "vitest";
import { isSafeHref } from "./safeHref";

describe("isSafeHref", () => {
  it("returns true for safe http and https URLs", () => {
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("https://example.com/path?query=1#hash")).toBe(true);
  });

  it("returns true for mailto: and tel: links", () => {
    expect(isSafeHref("mailto:user@example.com")).toBe(true);
    expect(isSafeHref("tel:+1234567890")).toBe(true);
  });

  it("returns true for relative paths and anchors", () => {
    expect(isSafeHref("/about")).toBe(true);
    expect(isSafeHref("relative/path")).toBe(true);
    expect(isSafeHref("#section")).toBe(true);
    expect(isSafeHref("?search=test")).toBe(true);
  });

  it("returns false for unsafe schemes like javascript: and data:", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeHref("file:///etc/passwd")).toBe(false);
  });

  it("strips control characters and handles percent-encoded control characters", () => {
    expect(isSafeHref("java\0script:alert(1)")).toBe(false);
    expect(isSafeHref("java%00script:alert(1)")).toBe(false);
    expect(isSafeHref("java\x01script:alert(1)")).toBe(false);
  });

  it("handles malformed percent-encoded sequences via decodeURIComponent fallback", () => {
    expect(isSafeHref("%E0%A0%AB")).toBe(true);
    expect(isSafeHref("http://example.com/%E0%A0%AB")).toBe(true);
    expect(isSafeHref("javascript:%E0%A0%AB")).toBe(false);
  });

  it("returns false when normalized URL is empty or only control characters", () => {
    expect(isSafeHref("")).toBe(false);
    expect(isSafeHref("\u0000\u0001\u001F")).toBe(false);
    expect(isSafeHref("%00")).toBe(false);
  });

  it("handles invalid URLs that cause the URL constructor to throw", () => {
    expect(isSafeHref("http://example.com:999999")).toBe(false);
    expect(isSafeHref("http://[invalid]")).toBe(false);
    expect(isSafeHref("http://:80")).toBe(false);
    expect(isSafeHref("https://::1")).toBe(false);
  });
});
