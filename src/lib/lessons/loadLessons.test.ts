import { describe, expect, it, vi } from "vitest";
import { getAllLessons, getLessonByIdFromBundle, loadLessonsForLocale } from "./loadLessons";

vi.mock("@/data/lessonBundles.en", () => ({
  lessons: [
    { id: "lesson-1", title: "Lesson One", categoryId: "basics" },
    { id: "lesson-2", title: "Lesson Two", categoryId: "basics" },
  ],
}));

vi.mock("@/data/lessonBundles.es", () => ({
  lessons: [
    { id: "lesson-1", title: "Lección Uno", categoryId: "basics" },
    { id: "lesson-3", title: "Lección Tres", categoryId: "advanced" },
  ],
}));

describe("loadLessons", () => {
  describe("getAllLessons", () => {
    it("returns all lessons for the specified locale", () => {
      const lessonsEn = getAllLessons("en");
      expect(lessonsEn).toHaveLength(2);
      expect(lessonsEn[0]!.title).toBe("Lesson One");
      expect(lessonsEn[1]!.title).toBe("Lesson Two");

      const lessonsEs = getAllLessons("es");
      expect(lessonsEs).toHaveLength(2);
      expect(lessonsEs[0]!.title).toBe("Lección Uno");
      expect(lessonsEs[1]!.title).toBe("Lección Tres");
    });
  });

  describe("getLessonByIdFromBundle", () => {
    it("returns the lesson matching the id and locale", () => {
      const lesson = getLessonByIdFromBundle("lesson-1", "en");
      expect(lesson).toBeDefined();
      expect(lesson?.title).toBe("Lesson One");

      const lessonEs = getLessonByIdFromBundle("lesson-1", "es");
      expect(lessonEs).toBeDefined();
      expect(lessonEs?.title).toBe("Lección Uno");
    });

    it("returns undefined if the lesson is not found for the given locale", () => {
      const nonExistent = getLessonByIdFromBundle("unknown-lesson", "en");
      expect(nonExistent).toBeUndefined();

      const existsInOtherLocaleOnly = getLessonByIdFromBundle("lesson-2", "es");
      expect(existsInOtherLocaleOnly).toBeUndefined();
    });
  });

  describe("loadLessonsForLocale", () => {
    it("dynamic-imports the English locale module", async () => {
      const lessons = await loadLessonsForLocale("en");
      expect(lessons).toHaveLength(2);
      expect(lessons[0]!.title).toBe("Lesson One");
    });

    it("dynamic-imports the Spanish locale module", async () => {
      const lessons = await loadLessonsForLocale("es");
      expect(lessons).toHaveLength(2);
      expect(lessons[0]!.title).toBe("Lección Uno");
    });
  });
});
