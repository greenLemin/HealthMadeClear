// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { setPreferenceCookie } from "./preferences";

describe("setPreferenceCookie", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(";").forEach(function(c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it("does nothing when document is undefined", () => {
    // Temporarily mock document as undefined to test the early return
    const originalDocument = global.document;
    // @ts-expect-error - overriding for testing
    delete global.document;

    expect(() => setPreferenceCookie("test", "value")).not.toThrow();

    // Restore document
    global.document = originalDocument;
  });

  it("sets a basic cookie with the correct value", () => {
    process.env.NODE_ENV = "development";
    setPreferenceCookie("hmc-theme", "dark");

    expect(document.cookie).toContain("hmc-theme=dark");
  });

  it("encodes the cookie value", () => {
    process.env.NODE_ENV = "development";
    setPreferenceCookie("test-special", "hello world &");

    expect(document.cookie).toContain("test-special=hello%20world%20%26");
  });

  it("includes secure flag in production environment", () => {
    process.env.NODE_ENV = "production";

    // Spy on document.cookie setter to verify the exact string passed
    // since jsdom might hide attributes like Secure or SameSite when reading
    const cookieSpy = vi.spyOn(document, 'cookie', 'set');

    setPreferenceCookie("hmc-locale", "es");

    expect(cookieSpy).toHaveBeenCalledWith(
      expect.stringContaining("hmc-locale=es")
    );
    expect(cookieSpy).toHaveBeenCalledWith(
      expect.stringContaining(";Secure")
    );
    expect(cookieSpy).toHaveBeenCalledWith(
      expect.stringContaining("SameSite=Lax")
    );
    expect(cookieSpy).toHaveBeenCalledWith(
      expect.stringContaining("max-age=31536000")
    );
  });
});
