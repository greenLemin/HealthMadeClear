import { describe, expect, it, vi } from "vitest";
import { getAllGlossaryTerms, getGlossaryTermById, getGlossaryLabelFromBundle } from "./loadGlossary";

// Mock glossaryBundles
vi.mock("@/data/glossaryBundles", () => ({
  glossaryBundles: {
    en: [
      { id: "term1", term: "Term One", definition: "Def 1" },
      { id: "term2", term: "Term Two", definition: "Def 2" },
    ],
    es: [
      { id: "term1", term: "Término Uno", definition: "Def 1 es" },
      { id: "term2", term: "Término Dos", definition: "Def 2 es" },
    ],
  },
}));

describe("loadGlossary", () => {
  describe("getAllGlossaryTerms", () => {
    it("returns all glossary terms for a given locale", () => {
      const termsEn = getAllGlossaryTerms("en");
      expect(termsEn).toHaveLength(2);
      expect(termsEn[0].term).toBe("Term One");

      const termsEs = getAllGlossaryTerms("es");
      expect(termsEs).toHaveLength(2);
      expect(termsEs[0].term).toBe("Término Uno");
    });
  });

  describe("getGlossaryTermById", () => {
    it("returns the term matching the given id and locale", () => {
      const term = getGlossaryTermById("term1", "en");
      expect(term).toBeDefined();
      expect(term?.term).toBe("Term One");
    });

    it("returns undefined if the term is not found", () => {
      const term = getGlossaryTermById("non-existent", "en");
      expect(term).toBeUndefined();
    });
  });

  describe("getGlossaryLabelFromBundle", () => {
    it("returns the term label if found", () => {
      const label = getGlossaryLabelFromBundle("term2", "es");
      expect(label).toBe("Término Dos");
    });

    it("returns the id if the term is not found", () => {
      const label = getGlossaryLabelFromBundle("unknown-term", "en");
      expect(label).toBe("unknown-term");
    });
  });
});
