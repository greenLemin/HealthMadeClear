import { describe, expect, it } from "vitest";
import { getAllGlossaryFromMdx, getGlossaryTermFromMdx } from "@/lib/glossary/mdxParser";

describe("glossary mdxParser", () => {
  it("loads all English glossary terms from MDX", () => {
    const terms = getAllGlossaryFromMdx("en");
    expect(terms).toHaveLength(31);
    expect(terms[0]?.definition.length).toBeGreaterThan(0);
  });

  it("loads Spanish term with translated label", () => {
    const term = getGlossaryTermFromMdx("hypertension", "es");
    expect(term?.term).toBe("Hipertensión");
  });

  it("preserves related term links", () => {
    const term = getGlossaryTermFromMdx("blood-pressure", "en");
    expect(term?.relatedTerms).toContain("hypertension");
  });
});
