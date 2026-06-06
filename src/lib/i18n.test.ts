import { describe, expect, it } from "vitest";
import { normalizeGlossaryLetter } from "@/lib/i18n";

describe("i18n helpers", () => {
  describe("normalizeGlossaryLetter", () => {
    it("returns empty string when given empty string", () => {
      expect(normalizeGlossaryLetter("")).toBe("");
    });

    it("trims whitespace and returns first letter uppercase", () => {
      expect(normalizeGlossaryLetter("  apple  ")).toBe("A");
    });

    it("removes accents/diacritics from letters", () => {
      expect(normalizeGlossaryLetter("ángel")).toBe("A");
      expect(normalizeGlossaryLetter("ç")).toBe("C");
      expect(normalizeGlossaryLetter("ñ")).toBe("N");
      expect(normalizeGlossaryLetter("é")).toBe("E");
      expect(normalizeGlossaryLetter("ü")).toBe("U");
    });

    it("preserves non-letters without accents", () => {
      expect(normalizeGlossaryLetter("1st")).toBe("1");
      expect(normalizeGlossaryLetter("!")).toBe("!");
    });
  });
});
