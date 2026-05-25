import { describe, expect, it } from "vitest";
import {
  getGlossaryTerms,
  getLearningPaths,
  getLessonById,
  getLessons,
} from "@/lib/localizedContent";

describe("localizedContent", () => {
  it("returns Spanish lesson titles when locale is es", () => {
    const lesson = getLessonById("understanding-prescription-labels", "es");
    expect(lesson?.title).toBe("Entender las etiquetas de receta");
  });

  it("returns Spanish path titles when locale is es", () => {
    const paths = getLearningPaths("es");
    const path = paths.find((p) => p.id === "doctor-visit-prep");
    expect(path?.title).toBe("Prepararte para tus consultas médicas");
  });

  it("returns Spanish glossary terms when locale is es", () => {
    const terms = getGlossaryTerms("es");
    const term = terms.find((t) => t.id === "diabetes");
    expect(term?.term).toBe("Diabetes");
  });

  it("falls back to English for unknown lesson ids", () => {
    const lesson = getLessonById("nonexistent-lesson", "es");
    expect(lesson).toBeUndefined();
  });

  it("preserves categoryId on localized lessons", () => {
    const lessons = getLessons("es");
    expect(lessons[0]?.categoryId).toBeDefined();
  });
});
