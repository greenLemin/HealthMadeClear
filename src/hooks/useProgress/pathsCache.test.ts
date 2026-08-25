import { describe, expect, it } from "vitest";
import { getPathsForLesson, getLoadPathsPromise } from "./pathsCache";
import type { LearningPath } from "@/types/learningPath";

describe("pathsCache", () => {
  describe("getPathsForLesson", () => {
    const mockPath1: LearningPath = {
      id: "path-1",
      slug: "path-1",
      title: "Path 1",
      description: "First path",
      category: "general",
      estimatedMinutes: 30,
      lessons: ["lesson-1", "lesson-2"],
    };

    const mockPath2: LearningPath = {
      id: "path-2",
      slug: "path-2",
      title: "Path 2",
      description: "Second path",
      category: "advanced",
      estimatedMinutes: 45,
      lessons: ["lesson-2", "lesson-3"],
    };

    const mockPathEmpty: LearningPath = {
      id: "path-empty",
      slug: "path-empty",
      title: "Empty Path",
      description: "Path with no lessons",
      category: "general",
      estimatedMinutes: 0,
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
      const result = getPathsForLesson([], "de", "lesson-1");
      expect(result).toEqual([]);
    });

    it("handles paths with empty lessons arrays gracefully on initial cache build", () => {
      const paths = [mockPathEmpty];
      const result = getPathsForLesson(paths, "it", "lesson-1");
      expect(result).toEqual([]);
    });

    it("caches path mapping per locale independently", () => {
      const esPaths = [mockPath1];
      const ptPaths = [mockPath2];

      const esResult = getPathsForLesson(esPaths, "es", "lesson-1");
      expect(esResult).toEqual([mockPath1]);

      const ptResult = getPathsForLesson(ptPaths, "pt", "lesson-3");
      expect(ptResult).toEqual([mockPath2]);

      const ptLesson1 = getPathsForLesson(ptPaths, "pt", "lesson-1");
      expect(ptLesson1).toEqual([]);
    });

    it("uses cached map on subsequent calls for the same locale", () => {
      const initialPaths = [mockPath1];
      const updatedPaths = [mockPath2];

      const result1 = getPathsForLesson(initialPaths, "fr", "lesson-1");
      expect(result1).toEqual([mockPath1]);

      const result2 = getPathsForLesson(updatedPaths, "fr", "lesson-1");
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
