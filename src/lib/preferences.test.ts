// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { readStoredJson, readStoredTextSize, PREFERENCE_COOKIES, STORAGE_KEYS } from "@/lib/preferences";

describe("preferences", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe("setPreferenceCookie", () => {
    let originalLocation: Location;
    let originalCookieDesc: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, protocol: "https:" },
        writable: true,
        configurable: true,
      });

      // jsdom document.cookie setter does not save 'Secure' in the cookie string
      // so we need to mock it to actually be able to test if it was set
      originalCookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
      let cookieStore = "";
      Object.defineProperty(document, "cookie", {
        get: () => cookieStore,
        set: (val) => {
          cookieStore = val;
        },
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
      if (originalCookieDesc) {
        Object.defineProperty(document, "cookie", originalCookieDesc);
      } else {
        Reflect.deleteProperty(document, "cookie");
      }
    });

    it("sets Secure flag when protocol is https:", async () => {
      window.location.protocol = "https:";
      const { setPreferenceCookie } = await import("@/lib/preferences");
      setPreferenceCookie("test-cookie", "value");
      expect(document.cookie).toContain("Secure");
    });

    it("does not set Secure flag when protocol is http:", async () => {
      window.location.protocol = "http:";
      const { setPreferenceCookie } = await import("@/lib/preferences");
      setPreferenceCookie("test-cookie", "value");
      expect(document.cookie).not.toContain("Secure");
    });
  });

  describe("readStoredJson", () => {
    it("returns null if window is undefined", () => {
      try {
        // Mock global scope to simulate window being undefined
        vi.stubGlobal("window", undefined);
        const validate = vi.fn((val) => val);
        const result = readStoredJson("some-key", validate);
        expect(result).toBeNull();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("returns null if key does not exist", () => {
      const validate = vi.fn((val) => val);
      const result = readStoredJson("nonexistent-key", validate);
      expect(result).toBeNull();
      expect(validate).not.toHaveBeenCalled();
    });

    it("returns parsed and validated data for valid JSON", () => {
      window.localStorage.setItem("valid-json-key", JSON.stringify({ a: 1 }));
      const validate = vi.fn((val) => val as { a: number });

      const result = readStoredJson("valid-json-key", validate);

      expect(result).toEqual({ a: 1 });
      expect(validate).toHaveBeenCalledWith({ a: 1 });
    });

    it("returns null when invalid JSON is present (error path)", () => {
      window.localStorage.setItem("invalid-json-key", "{ invalid json }");
      const validate = vi.fn((val) => val);

      const result = readStoredJson("invalid-json-key", validate);

      expect(result).toBeNull();
      expect(validate).not.toHaveBeenCalled();
    });

    it("returns null when validation fails or throws", () => {
      window.localStorage.setItem("valid-json-key", JSON.stringify({ a: 1 }));
      const validate = vi.fn(() => {
        throw new Error("Validation failed");
      });

      const result = readStoredJson("valid-json-key", validate);

      expect(result).toBeNull();
      expect(validate).toHaveBeenCalledWith({ a: 1 });
    });

    it("returns what validator returns", () => {
      window.localStorage.setItem("valid-json-key", JSON.stringify({ a: 1 }));
      const validate = vi.fn((val) => null); // validator rejects it

      const result = readStoredJson("valid-json-key", validate);

      expect(result).toBeNull();
      expect(validate).toHaveBeenCalledWith({ a: 1 });
    });
  });

  describe("readStoredTextSize", () => {
    let originalCookieDesc: PropertyDescriptor | undefined;

    beforeEach(() => {
      originalCookieDesc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
      let cookieStore = "";
      Object.defineProperty(document, "cookie", {
        get: () => cookieStore,
        set: (val) => {
          cookieStore = val;
        },
        configurable: true,
      });
    });

    afterEach(() => {
      if (originalCookieDesc) {
        Object.defineProperty(document, "cookie", originalCookieDesc);
      } else {
        Reflect.deleteProperty(document, "cookie");
      }
      vi.unstubAllGlobals();
      window.localStorage.clear();
    });

    it("returns from cookie if 'large'", () => {
      document.cookie = `${PREFERENCE_COOKIES.textSize}=large`;
      expect(readStoredTextSize()).toBe("large");
    });

    it("returns from cookie if 'largest'", () => {
      document.cookie = `${PREFERENCE_COOKIES.textSize}=largest`;
      expect(readStoredTextSize()).toBe("largest");
    });

    it("falls back to localStorage if cookie is invalid", () => {
      document.cookie = `${PREFERENCE_COOKIES.textSize}=invalid`;
      window.localStorage.setItem(STORAGE_KEYS.textSize, "large");
      expect(readStoredTextSize()).toBe("large");
    });

    it("returns from localStorage if cookie is absent", () => {
      window.localStorage.setItem(STORAGE_KEYS.textSize, "largest");
      expect(readStoredTextSize()).toBe("largest");
    });

    it("defaults to 'standard' if neither has valid value", () => {
      document.cookie = `${PREFERENCE_COOKIES.textSize}=invalid`;
      window.localStorage.setItem(STORAGE_KEYS.textSize, "invalid");
      expect(readStoredTextSize()).toBe("standard");
    });

    it("defaults to 'standard' if window is undefined", () => {
      vi.stubGlobal("window", undefined);
      // document is typically undefined too in this case but we're testing the typeof window check
      expect(readStoredTextSize()).toBe("standard");
    });
  });
});
