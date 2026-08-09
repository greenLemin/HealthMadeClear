import { describe, expect, it } from "vitest";
import { lessons } from "@/data/lessons";
import { learningPaths } from "@/data/learningPaths";
import type { LessonListItem } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";
import { getCompletedPathCount, getLessonsByPath, getPathProgress, getStartedPathCount } from "@/lib/content";

describe("content helpers", () => {
  it("returns lessons for a valid path", () => {
    const pathLessons = getLessonsByPath("safer-medicine-use", lessons, learningPaths);
    expect(pathLessons.length).toBe(8);
    expect(pathLessons[0]?.id).toBe("understanding-prescription-labels");
  });

  it("returns empty array for unknown path", () => {
    expect(getLessonsByPath("missing-path", lessons, learningPaths)).toEqual([]);
  });

  it("calculates path progress", () => {
    const progress = getPathProgress(
      "safer-medicine-use",
      ["understanding-prescription-labels"],
      lessons,
      learningPaths
    );
    expect(progress.completedCount).toBe(1);
    expect(progress.totalCount).toBe(8);
    expect(progress.percentage).toBe(13);
  });

  it("returns zero progress for unknown path", () => {
    const progress = getPathProgress("missing-path", [], lessons, learningPaths);
    expect(progress.totalCount).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  describe("getStartedPathCount", () => {
    // getStartedPathCount only reads ids and a path's lesson list, but the
    // fixtures are built to the real shapes so the test keeps type checking.
    const makeLesson = (id: string): LessonListItem => ({
      id: id as LessonListItem["id"],
      title: id,
      description: "",
      category: "cat",
      categoryId: "intro" as LessonListItem["categoryId"],
      duration: "5 min",
      level: "beginner",
    });

    const makePath = (id: string, lessonIds: string[]): LearningPath => ({
      id: id as LearningPath["id"],
      title: id,
      description: "",
      duration: "1 hour",
      level: "beginner",
      icon: "icon",
      lessons: lessonIds as LearningPath["lessons"],
    });

    const mockLessons = ["l1", "l2", "l3"].map(makeLesson);
    const mockPaths = [
      makePath("p1", ["l1", "l2"]),
      makePath("p2", ["l3"]),
      makePath("p3", ["l4"]), // l4 is not a known lesson
    ];

    it("returns 0 for empty progress", () => {
      expect(getStartedPathCount([], [], mockLessons, mockPaths)).toBe(0);
    });

    it("counts explicitly started paths", () => {
      expect(getStartedPathCount([], ["p1"], mockLessons, mockPaths)).toBe(1);
      expect(getStartedPathCount([], ["p1", "p2"], mockLessons, mockPaths)).toBe(2);
    });

    it("counts implicitly started paths via completed lessons", () => {
      expect(getStartedPathCount(["l1"], [], mockLessons, mockPaths)).toBe(1);
      expect(getStartedPathCount(["l1", "l3"], [], mockLessons, mockPaths)).toBe(2);
    });

    it("does not count paths with invalid completed lessons", () => {
      expect(getStartedPathCount(["l4"], [], mockLessons, mockPaths)).toBe(0);
    });

    it("does not double-count paths", () => {
      expect(getStartedPathCount(["l1"], ["p1"], mockLessons, mockPaths)).toBe(1);
      expect(getStartedPathCount(["l1", "l2"], [], mockLessons, mockPaths)).toBe(1);
    });
  });

  it("counts completed paths only when all lessons done", () => {
    const partial = getCompletedPathCount(["understanding-prescription-labels"], lessons, learningPaths);
    expect(partial).toBe(0);

    const full = getCompletedPathCount(
      [
        "understanding-prescription-labels",
        "asking-about-medications",
        "managing-side-effects",
        "generic-vs-brand-drugs",
        "pain-medications-safely",
        "otc-drug-interactions",
        "drug-food-interactions",
        "antibiotic-stewardship",
      ],
      lessons,
      learningPaths
    );
    expect(full).toBe(1);
  });
});
