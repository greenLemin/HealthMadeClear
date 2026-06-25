import { describe, expect, it } from "vitest";
import { LESSON_IDS } from "@/types/content";
import { getAllLessonsFromMdx, getLessonFromMdx } from "@/lib/lessons/mdxParser";

describe("mdxParser", () => {
  it("loads all English lessons from MDX", () => {
    const lessons = getAllLessonsFromMdx("en");
    expect(lessons).toHaveLength(LESSON_IDS.length);
    expect(lessons[0]?.content.sections.length).toBeGreaterThan(0);
  });

  it("loads Spanish lesson with translated title", () => {
    const lesson = getLessonFromMdx("understanding-prescription-labels", "es");
    expect(lesson?.title).toBe("Entender las etiquetas de receta");
  });

  it("parses callout blocks into section callouts", () => {
    const lesson = getLessonFromMdx("otc-drug-interactions", "en");
    const withCallout = lesson?.content.sections.find((s) => s.callouts?.length);
    expect(withCallout?.callouts?.[0]?.type).toBe("warning");
  });
});
