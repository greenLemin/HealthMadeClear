import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "./sanitizeRedirect";

describe("sanitizeRedirectPath", () => {
  it("allows relative paths", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/en/dashboard/settings")).toBe("/en/dashboard/settings");
  });

  it("rejects open redirects", () => {
    expect(sanitizeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/\\evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath(null)).toBe("/dashboard");
  });

  it("rejects null byte and control character injection attempts", () => {
    expect(sanitizeRedirectPath("/%00/evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/\0/evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("%00//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/\x01/evil.com")).toBe("/dashboard");
  });

  it("uses custom fallback", () => {
    expect(sanitizeRedirectPath(null, "/learn")).toBe("/learn");
  });
});
