import { describe, expect, it } from "vitest";
import { sanitizeRedirectPath } from "./sanitizeRedirect";

describe("sanitizeRedirectPath", () => {
  it("allows relative paths", () => {
    expect(sanitizeRedirectPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirectPath("/en/dashboard/settings")).toBe("/en/dashboard/settings");
  });

  it("rejects open redirects", () => {
    expect(sanitizeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirectPath(null)).toBe("/dashboard");
  });

  it("uses custom fallback", () => {
    expect(sanitizeRedirectPath(null, "/learn")).toBe("/learn");
  });
});
