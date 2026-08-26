import { describe, expect, it } from "vitest";
import { getPathsForLesson, getLoadPathsPromise } from "./pathsCache";
import type { LearningPath } from "@/types/learningPath";
import type { PathId } from "@/types/content";
import type { Locale } from "@/lib/i18n";

describe("pathsCache", () => {
  describe("getPathsForLesson", () => {
    const mockPath1: LearningPath = {
      id: "safer-medicine-use" as PathId,
      title: "Path 1",
      description: "First path",
      duration: "30 min",
      level: "beginner",
      icon: "Pill",
      lessons: ["lesson-1", "lesson-2"],
    };

    const mockPath2: LearningPath = {
      id: "doctor-visit-prep" as PathId,
      title: "Path 2",
      description: "Second path",
      duration: "45 min",
      level: "intermediate",
      icon: "Stethoscope",
      lessons: ["lesson-2", "lesson-3"],
    };

    const mockPathEmpty: LearningPath = {
      id: "understanding-labs" as PathId,
      title: "Empty Path",
      description: "Path with no lessons",
      duration: "0 min",
      level: "beginner",
      icon: "FileText",
      lessons: [],
    };

    it("returns learning paths containing the requested lesson ID", () => {
      const paths = [mockPath1, mockPath2];
      const result = getPathsForLesson(paths, "en", "lesson-1");
      expect(result).toEqual([mockPath1]);
    });

    it("returns multiple learning paths when a lesson is in multiple paths", () => {
      const paths = [mockPath1, mockPath2];
      const result = getPathsForLesson(paths, "en", "lesson-2");
      expect(result).toEqual([mockPath1, mockPath2]);
    });

    it("returns empty array when lesson ID is not in any path", () => {
      const paths = [mockPath1, mockPath2];
      const result = getPathsForLesson(paths, "en", "non-existent-lesson");
      expect(result).toEqual([]);
    });

    it("returns empty array when paths list is empty on initial cache build", () => {
      const result = getPathsForLesson([], "de" as Locale, "lesson-1");
      expect(result).toEqual([]);
    });

    it("handles paths with empty lessons arrays gracefully on initial cache build", () => {
      const paths = [mockPathEmpty];
      const result = getPathsForLesson(paths, "it" as Locale, "lesson-1");
      expect(result).toEqual([]);
    });

    it("caches path mapping per locale independently", () => {
      const esPaths = [mockPath1];
      const ptPaths = [mockPath2];

      const esResult = getPathsForLesson(esPaths, "es", "lesson-1");
      expect(esResult).toEqual([mockPath1]);

      const ptResult = getPathsForLesson(ptPaths, "pt" as Locale, "lesson-3");
      expect(ptResult).toEqual([mockPath2]);

      const ptLesson1 = getPathsForLesson(ptPaths, "pt" as Locale, "lesson-1");
      expect(ptLesson1).toEqual([]);
    });

    it("uses cached map on subsequent calls for the same locale", () => {
      const initialPaths = [mockPath1];
      const updatedPaths = [mockPath2];

      const result1 = getPathsForLesson(initialPaths, "fr" as Locale, "lesson-1");
      expect(result1).toEqual([mockPath1]);

      const result2 = getPathsForLesson(updatedPaths, "fr" as Locale, "lesson-1");
      expect(result2).toEqual([mockPath1]);
    });
  });

  describe("getLoadPathsPromise", () => {
    it("returns a promise that resolves the module", async () => {
      const promise = getLoadPathsPromise();
      expect(promise).toBeInstanceOf(Promise);
      const loadedModule = await promise;
      expect(loadedModule).toBeDefined();
    });

    it("returns the exact same promise instance on subsequent calls", () => {
      const promise1 = getLoadPathsPromise();
      const promise2 = getLoadPathsPromise();
      expect(promise1).toBe(promise2);
    });
  });
});
