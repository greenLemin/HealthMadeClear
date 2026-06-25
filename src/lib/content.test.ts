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
