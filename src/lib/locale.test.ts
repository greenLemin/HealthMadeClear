import { describe, it, expect } from "vitest";
import { requireLocale } from "./locale";

describe("locale", () => {
  describe("requireLocale", () => {
    it("returns the locale when it is valid", () => {
      expect(requireLocale("en")).toBe("en");
      expect(requireLocale("es")).toBe("es");
    });

    it("throws an error when the locale is invalid", () => {
      expect(() => requireLocale("fr")).toThrowError("Invalid locale: fr");
      expect(() => requireLocale("invalid")).toThrowError("Invalid locale: invalid");
      expect(() => requireLocale("")).toThrowError("Invalid locale: ");
    });
  });
});
