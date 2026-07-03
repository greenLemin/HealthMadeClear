import { describe, expect, it } from "vitest";
import { getGlossaryRegexAndMap } from "./highlighterCache";
import type { GlossaryTerm } from "@/types/glossary";

describe("getGlossaryRegexAndMap", () => {
  it("returns empty structure for empty terms array", () => {
    const result = getGlossaryRegexAndMap([]);
    expect(result.termMap.size).toBe(0);
    expect(result.regex.source).toBe("(?:)");
  });

  it("generates correct regex and map for terms", () => {
    const terms: GlossaryTerm[] = [
      { id: "1", term: "JavaScript", definition: "A language", category: "lang" },
      { id: "2", term: "C++", definition: "Another language", category: "lang" },
      { id: "3", term: "JS", definition: "Short for JavaScript", category: "lang" }
    ];

    const result = getGlossaryRegexAndMap(terms);

    // Map should contain lowercase keys
    expect(result.termMap.get("javascript")?.id).toBe("1");
    expect(result.termMap.get("c++")?.id).toBe("2");
    expect(result.termMap.get("js")?.id).toBe("3");

    // Regex should be sorted by length descending: JavaScript, C++, JS
    expect(result.regex.source).toBe("\\b(JavaScript|C\\+\\+|JS)\\b");
    expect(result.regex.flags).toBe("gi");
  });

  it("escapes special characters in regex", () => {
    const terms: GlossaryTerm[] = [
      { id: "1", term: "React.js", definition: "React", category: "lib" },
      { id: "2", term: "$var", definition: "Variable", category: "var" },
      { id: "3", term: "C#", definition: "C Sharp", category: "lang" },
    ];

    const result = getGlossaryRegexAndMap(terms);
    expect(result.regex.source).toBe("\\b(React\\.js|\\$var|C#)\\b");
  });

  it("caches the result for the same array reference in WeakMap", () => {
    const terms: GlossaryTerm[] = [
      { id: "1", term: "Test", definition: "A test", category: "test" }
    ];

    const result1 = getGlossaryRegexAndMap(terms);
    const result2 = getGlossaryRegexAndMap(terms);

    expect(result1).toBe(result2); // Should be exactly the same reference
  });

  it("recomputes if a new array reference is provided", () => {
    const terms1: GlossaryTerm[] = [
      { id: "1", term: "Test", definition: "A test", category: "test" }
    ];
    const terms2: GlossaryTerm[] = [
      { id: "1", term: "Test", definition: "A test", category: "test" }
    ];

    const result1 = getGlossaryRegexAndMap(terms1);
    const result2 = getGlossaryRegexAndMap(terms2);

    expect(result1).not.toBe(result2);
  });
});
