import { describe, expect, it, vi } from "vitest";
import fs from "fs";
import { LESSON_IDS } from "@/types/content";
import { getAllLessonsFromMdx, getLessonFromMdx } from "@/lib/lessons/mdxParser";

describe("mdxParser", () => {
  it("loads all English lessons from MDX", async () => {
    const lessons = await getAllLessonsFromMdx("en");
    expect(lessons).toHaveLength(LESSON_IDS.length);
    expect(lessons[0]?.content.sections.length).toBeGreaterThan(0);
  });

  it("loads Spanish lesson with translated title", async () => {
    const lesson = await getLessonFromMdx("understanding-prescription-labels", "es");
    expect(lesson?.title).toBe("Entender las etiquetas de receta");
  });

  it("parses callout blocks into section callouts", async () => {
    const lesson = await getLessonFromMdx("otc-drug-interactions", "en");
    const withCallout = lesson?.content.sections.find((s) => s.callouts?.length);
    expect(withCallout?.callouts?.[0]?.type).toBe("warning");
  });

  it("throws an error when a lesson MDX file is missing in getAllLessonsFromMdx", async () => {
    const spy = vi.spyOn(fs.promises, "access").mockRejectedValueOnce(new Error("ENOENT"));
    await expect(getAllLessonsFromMdx("en")).rejects.toThrow(/Missing lesson MDX file/);
    spy.mockRestore();
  });

  it("returns undefined when a lesson MDX file is missing in getLessonFromMdx", async () => {
    const spy = vi.spyOn(fs.promises, "access").mockRejectedValueOnce(new Error("ENOENT"));
    const lesson = await getLessonFromMdx("nonexistent-lesson", "en");
    expect(lesson).toBeUndefined();
    spy.mockRestore();
  });
});
