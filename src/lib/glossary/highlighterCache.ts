import type { GlossaryTerm } from "@/types/glossary";

interface GlossaryCacheEntry {
  termMap: Map<string, GlossaryTerm>;
  regex: RegExp;
}

const glossaryCache = new WeakMap<GlossaryTerm[], GlossaryCacheEntry>();
let lastTermsFallback: GlossaryTerm[] | null = null;
let lastCacheFallback: GlossaryCacheEntry | null = null;

export function getGlossaryRegexAndMap(glossaryTerms: GlossaryTerm[]): GlossaryCacheEntry {
  if (glossaryTerms.length === 0) {
    return { termMap: new Map(), regex: /(?:)/ };
  }

  let cacheEntry = glossaryCache.get(glossaryTerms);

  if (!cacheEntry) {
    if (
      lastTermsFallback &&
      lastTermsFallback.length === glossaryTerms.length &&
      lastTermsFallback[0].id === glossaryTerms[0].id
    ) {
      cacheEntry = lastCacheFallback!;
    } else {
      const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);
      const termMap = new Map<string, GlossaryTerm>();
      const patterns: string[] = [];

      for (const termObj of sortedTerms) {
        termMap.set(termObj.term.toLowerCase(), termObj);
        patterns.push(termObj.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      }

      const regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
      cacheEntry = { termMap, regex };

      try {
        glossaryCache.set(glossaryTerms, cacheEntry);
      } catch (e) {
        // Ignore if not an object
      }
      lastTermsFallback = glossaryTerms;
      lastCacheFallback = cacheEntry;
    }
  }

  return cacheEntry;
}
