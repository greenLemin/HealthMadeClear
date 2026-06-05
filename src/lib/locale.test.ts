import { describe, it, expect } from "vitest";
import { parseLocale, requireLocale } from "./locale";

describe("locale", () => {
  describe("parseLocale", () => {
    it("returns the locale when it is valid", () => {
      expect(parseLocale("en")).toBe("en");
      expect(parseLocale("es")).toBe("es");
    });

    it("returns null when the locale is invalid", () => {
      expect(parseLocale("fr")).toBeNull();
      expect(parseLocale("invalid")).toBeNull();
      expect(parseLocale("")).toBeNull();
    });
  });

  describe("requireLocale", () => {
    it("returns the locale when it is valid", () => {
      expect(requireLocale("en")).toBe("en");
      expect(requireLocale("es")).toBe("es");
    });

    it("throws an error when the locale is invalid", () => {
      expect(() => requireLocale("fr")).toThrowError("Invalid locale: fr");
      expect(() => requireLocale("invalid")).toThrowError("Invalid locale: invalid");
    });
  });
});
