import { describe, expect, it } from "vitest";
import { parseLocale, requireLocale } from "@/lib/locale";

describe("locale", () => {
  describe("parseLocale", () => {
    it("returns the locale for valid locales", () => {
      expect(parseLocale("en")).toBe("en");
      expect(parseLocale("es")).toBe("es");
    });

    it("returns null for invalid locales", () => {
      expect(parseLocale("fr")).toBeNull();
      expect(parseLocale("invalid")).toBeNull();
      expect(parseLocale("")).toBeNull();
    });
  });

  describe("requireLocale", () => {
    it("returns the locale for valid locales", () => {
      expect(requireLocale("en")).toBe("en");
      expect(requireLocale("es")).toBe("es");
    });

    it("throws an error for invalid locales", () => {
      expect(() => requireLocale("fr")).toThrowError("Invalid locale: fr");
      expect(() => requireLocale("invalid")).toThrowError("Invalid locale: invalid");
      expect(() => requireLocale("")).toThrowError("Invalid locale: ");
    });
  });
});
