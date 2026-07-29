import { describe, expect, it } from "vitest";
import { lessons } from "@/data/lessons";
import { learningPaths } from "@/data/learningPaths";
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

  it("counts started paths from explicit starts or lesson progress", () => {
    expect(getStartedPathCount([], [], lessons, learningPaths)).toBe(0);
    expect(getStartedPathCount(["understanding-prescription-labels"], [], lessons, learningPaths)).toBe(1);
    expect(getStartedPathCount([], ["doctor-visit-prep"], lessons, learningPaths)).toBe(1);
  });

  describe("getCompletedPathCount", () => {
    const mockLessonItems = [
      { id: "understanding-prescription-labels" },
      { id: "asking-about-medications" },
      { id: "managing-side-effects" },
    ] as any[];

    const mockPathItems = [
      {
        id: "safer-medicine-use",
        lessons: ["understanding-prescription-labels", "asking-about-medications"],
      },
      { id: "navigating-healthcare", lessons: ["managing-side-effects"] },
    ] as any[];

    it("returns 0 when no paths are completed", () => {
      expect(getCompletedPathCount([], mockLessonItems, mockPathItems)).toBe(0);
    });

    it("returns 0 when a path is only partially completed", () => {
      expect(
        getCompletedPathCount(["understanding-prescription-labels"], mockLessonItems, mockPathItems)
      ).toBe(0);
    });

    it("counts a path as completed when all its valid lessons are completed", () => {
      expect(
        getCompletedPathCount(
          ["understanding-prescription-labels", "asking-about-medications"],
          mockLessonItems,
          mockPathItems
        )
      ).toBe(1);
      expect(getCompletedPathCount(["managing-side-effects"], mockLessonItems, mockPathItems)).toBe(1);
    });

    it("counts multiple completed paths", () => {
      expect(
        getCompletedPathCount(
          ["understanding-prescription-labels", "asking-about-medications", "managing-side-effects"],
          mockLessonItems,
          mockPathItems
        )
      ).toBe(2);
    });

    it("ignores invalid lessons when checking for completion", () => {
      const pathWithMixed = [
        { id: "safer-medicine-use", lessons: ["understanding-prescription-labels", "invalid-lesson"] },
      ] as any[];
      expect(
        getCompletedPathCount(["understanding-prescription-labels"], mockLessonItems, pathWithMixed)
      ).toBe(1);
    });

    it("does not count paths with no valid lessons as completed", () => {
      const emptyAndInvalidPaths = [
        { id: "safer-medicine-use", lessons: [] },
        { id: "navigating-healthcare", lessons: ["invalid-lesson"] },
      ] as any[];
      expect(
        getCompletedPathCount(
          ["understanding-prescription-labels", "asking-about-medications", "managing-side-effects"],
          mockLessonItems,
          emptyAndInvalidPaths
        )
      ).toBe(0);
    });
  });
});
