import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates titles", () => {
    expect(slugify("Understanding Your EOB")).toBe("understanding-your-eob");
  });

  it("strips combining marks so Spanish titles stay ASCII ids", () => {
    expect(slugify("¿Qué es un EOB?")).toBe("que-es-un-eob");
  });

  it("falls back to section for empty or punctuation-only titles", () => {
    expect(slugify("")).toBe("section");
    expect(slugify("   ")).toBe("section");
    expect(slugify("???")).toBe("section");
  });

  it("suffixes duplicate titles with -2 then -3", () => {
    const used = new Set<string>();
    expect(slugify("Introduction", used)).toBe("introduction");
    expect(slugify("Introduction", used)).toBe("introduction-2");
    expect(slugify("Introduction", used)).toBe("introduction-3");
  });

  it("treats titles that collapse to the same base as duplicates", () => {
    const used = new Set<string>();
    expect(slugify("Hello World", used)).toBe("hello-world");
    expect(slugify("hello-world", used)).toBe("hello-world-2");
  });

  it("skips an already-taken -2 suffix", () => {
    const used = new Set<string>(["section", "section-2"]);
    expect(slugify("", used)).toBe("section-3");
  });
});
