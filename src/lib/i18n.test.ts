import { describe, expect, it } from "vitest";
import { formatLevel, getCategoryLabel, normalizeGlossaryLetter } from "./i18n";

describe("i18n", () => {
  describe("formatLevel", () => {
    it("returns correct English labels for all levels", () => {
      expect(formatLevel("beginner", "en")).toBe("Beginner");
      expect(formatLevel("intermediate", "en")).toBe("Intermediate");
      expect(formatLevel("advanced", "en")).toBe("Advanced");
    });

    it("returns correct Spanish labels for all levels", () => {
      expect(formatLevel("beginner", "es")).toBe("Principiante");
      expect(formatLevel("intermediate", "es")).toBe("Intermedio");
      expect(formatLevel("advanced", "es")).toBe("Avanzado");
    });
  });

  describe("getCategoryLabel", () => {
    it("returns correct English category label", () => {
      expect(getCategoryLabel("medication-safety", "en")).toBe("Medication Safety");
    });

    it("returns correct Spanish category label", () => {
      expect(getCategoryLabel("medication-safety", "es")).toBe("Seguridad con medicamentos");
    });
  });

  describe("normalizeGlossaryLetter", () => {
    it("returns capitalized first letter", () => {
      expect(normalizeGlossaryLetter("apple")).toBe("A");
      expect(normalizeGlossaryLetter("Apple")).toBe("A");
    });

    it("strips diacritics", () => {
      expect(normalizeGlossaryLetter("álvarez")).toBe("A");
      expect(normalizeGlossaryLetter("Éxito")).toBe("E");
      expect(normalizeGlossaryLetter("ñandú")).toBe("N");
    });

    it("handles whitespace", () => {
      expect(normalizeGlossaryLetter("  banana  ")).toBe("B");
    });
  });
});
