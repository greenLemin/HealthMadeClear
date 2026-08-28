import { describe, it, expect } from "vitest";
import { BEGINNER_LESSON_IDS, LESSON_LEVELS } from "./lessonMeta";
import { lessons as enLessons } from "./lessonBundles.en";

describe("lessonMeta", () => {
  it("has a non-empty BEGINNER_LESSON_IDS array", () => {
    expect(BEGINNER_LESSON_IDS.length).toBeGreaterThan(0);
  });

  it("BEGINNER_LESSON_IDS equals every id in the EN lesson bundle where level === beginner", () => {
    const expectedBeginnerIds = enLessons
      .filter((lesson) => lesson.level === "beginner")
      .map((lesson) => lesson.id);

    expect(BEGINNER_LESSON_IDS).toEqual(expectedBeginnerIds);
  });

  it("LESSON_LEVELS matches the level of every lesson in the EN bundle", () => {
    for (const lesson of enLessons) {
      expect(LESSON_LEVELS[lesson.id]).toBe(lesson.level);
    }
  });
});
