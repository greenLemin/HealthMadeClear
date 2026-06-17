// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { readStoredJson, readStoredStringArray, writeStoredJson } from "@/lib/preferences";

describe("preferences", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
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
});
