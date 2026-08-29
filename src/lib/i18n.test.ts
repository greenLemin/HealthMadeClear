import { describe, expect, it } from "vitest";
import {
  formatLevel,
  getCategoryLabel,
  normalizeGlossaryLetter,
  formatDuration,
  formatTimeSpentMinutes,
  formatReviewDate,
} from "./i18n";

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

  describe("formatDuration", () => {
    it("formats minutes less than 60 in English", () => {
      expect(formatDuration(45, "en")).toBe("45 min");
    });

    it("formats minutes less than 60 in Spanish", () => {
      expect(formatDuration(45, "es")).toBe("45 min");
    });

    it("formats exact hours in English", () => {
      expect(formatDuration(120, "en")).toBe("2h");
    });

    it("formats exact hours in Spanish", () => {
      expect(formatDuration(120, "es")).toBe("2h");
    });

    it("formats hours and minutes in English", () => {
      expect(formatDuration(90, "en")).toBe("1h 30m");
    });

    it("formats hours and minutes in Spanish", () => {
      expect(formatDuration(90, "es")).toBe("1h 30m");
    });
  });

  describe("formatTimeSpentMinutes", () => {
    it("returns the unavailable marker when minutes are unused", () => {
      expect(formatTimeSpentMinutes(0, "en", "—")).toBe("—");
      expect(formatTimeSpentMinutes(0, "es", "—")).toBe("—");
    });

    it("formats non-zero minutes", () => {
      expect(formatTimeSpentMinutes(45, "en", "—")).toBe("45 min");
    });
  });

  describe("formatReviewDate", () => {
    it("returns empty string if date is not provided", () => {
      expect(formatReviewDate("", "en")).toBe("");
      expect(formatReviewDate("", "es")).toBe("");
    });

    it("formats date in English", () => {
      expect(formatReviewDate("2023-11-15", "en")).toBe("November 15, 2023");
    });

    it("formats date in Spanish", () => {
      expect(formatReviewDate("2023-11-15", "es")).toBe("15 de noviembre de 2023");
    });
  });
});
