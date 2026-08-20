import { describe, expect, it } from "vitest";
import { isSafeHref } from "./safeHref";

describe("isSafeHref", () => {
  it("allows safe protocols (http, https, mailto, tel)", () => {
    expect(isSafeHref("http://example.com")).toBe(true);
    expect(isSafeHref("https://example.com/path?query=1#hash")).toBe(true);
    expect(isSafeHref("mailto:user@example.com")).toBe(true);
    expect(isSafeHref("tel:+1234567890")).toBe(true);
  });

  it("allows relative paths and anchor links", () => {
    expect(isSafeHref("/lessons/understanding-prescriptions")).toBe(true);
    expect(isSafeHref("../about")).toBe(true);
    expect(isSafeHref("./relative/path")).toBe(true);
    expect(isSafeHref("#section-1")).toBe(true);
    expect(isSafeHref("article-1#heading")).toBe(true);
  });

  it("rejects empty strings or strings containing only control characters/spaces", () => {
    expect(isSafeHref("")).toBe(false);
    expect(isSafeHref("   ")).toBe(false);
    expect(isSafeHref("\x00\x1F\x20")).toBe(false);
  });

  it("rejects dangerous or unsupported protocols", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHref("file:///etc/passwd")).toBe(false);
    expect(isSafeHref("vbscript:msgbox(1)")).toBe(false);
    expect(isSafeHref("blob:https://example.com/uuid")).toBe(false);
    expect(isSafeHref("ftp://example.com")).toBe(false);
  });

  it("blocks obfuscated/percent-encoded or control-character smuggled scheme payloads", () => {
    expect(isSafeHref("java%00script:alert(1)")).toBe(false);
    expect(isSafeHref("java\0script:alert(1)")).toBe(false);
    expect(isSafeHref("java\tscript:alert(1)")).toBe(false);
    expect(isSafeHref("java\r\nscript:alert(1)")).toBe(false);
    expect(isSafeHref("javascript%3aalert(1)")).toBe(false);
  });

  it("handles malformed URI escape sequences or invalid URLs gracefully", () => {
    expect(isSafeHref("https://example.com/%80path")).toBe(true);
    expect(isSafeHref("http://[invalid-ipv6")).toBe(false);
  });
});
