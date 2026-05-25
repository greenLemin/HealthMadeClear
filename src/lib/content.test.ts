import { describe, expect, it } from "vitest";
import {
  getCompletedPathCount,
  getLessonsByPath,
  getPathProgress,
  getStartedPathCount,
} from "@/lib/content";

describe("content helpers", () => {
  it("returns lessons for a valid path", () => {
    const pathLessons = getLessonsByPath("safer-medicine-use");
    expect(pathLessons.length).toBe(3);
    expect(pathLessons[0]?.id).toBe("understanding-prescription-labels");
  });

  it("calculates path progress", () => {
    const progress = getPathProgress("safer-medicine-use", ["understanding-prescription-labels"]);
    expect(progress.completedCount).toBe(1);
    expect(progress.totalCount).toBe(3);
    expect(progress.percentage).toBe(33);
  });

  it("counts started paths from explicit starts or lesson progress", () => {
    expect(getStartedPathCount([], [])).toBe(0);
    expect(getStartedPathCount(["understanding-prescription-labels"], [])).toBe(1);
    expect(getStartedPathCount([], ["doctor-visit-prep"])).toBe(1);
  });

  it("counts completed paths only when all lessons done", () => {
    const partial = getCompletedPathCount(["understanding-prescription-labels"]);
    expect(partial).toBe(0);

    const full = getCompletedPathCount([
      "understanding-prescription-labels",
      "asking-about-medications",
      "managing-side-effects",
    ]);
    expect(full).toBe(1);
  });
});
