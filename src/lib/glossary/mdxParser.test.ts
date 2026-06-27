import { describe, expect, it } from "vitest";
import { getAllGlossaryFromMdx, getGlossaryTermFromMdx } from "@/lib/glossary/mdxParser";

describe("glossary mdxParser", () => {
  it("loads all English glossary terms from MDX", async () => {
    const terms = await getAllGlossaryFromMdx("en");
    expect(terms).toHaveLength(31);
    expect(terms[0]?.definition.length).toBeGreaterThan(0);
  });

  it("loads Spanish term with translated label", async () => {
    const term = await getGlossaryTermFromMdx("hypertension", "es");
    expect(term?.term).toBe("Hipertensión");
  });

  it("preserves related term links", async () => {
    const term = await getGlossaryTermFromMdx("blood-pressure", "en");
    expect(term?.relatedTerms).toContain("hypertension");
  });

  it("loads related lesson links", async () => {
    const term = await getGlossaryTermFromMdx("diabetes", "en");
    expect(term?.relatedLessons).toContain("understanding-type2-diabetes");
  });
});
