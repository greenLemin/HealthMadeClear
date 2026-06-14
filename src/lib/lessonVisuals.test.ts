import { describe, expect, it } from "vitest";
import { getLessonCategoryVisual } from "@/lib/lessonVisuals";
import { LESSON_CATEGORY_IDS, type LessonCategoryId } from "@/types/content";

describe("lessonVisuals helpers", () => {
  describe("getLessonCategoryVisual", () => {
    it("returns correct visual data for specific valid categories", () => {
      expect(getLessonCategoryVisual("medication-safety")).toEqual({
        emoji: "💊",
        gradient: "from-primary-container to-secondary-container",
      });

      expect(getLessonCategoryVisual("emergency")).toEqual({
        emoji: "🚨",
        gradient: "from-error-container to-primary-container",
      });
    });

    it("returns defined visual data with string emoji and gradient for all valid categories", () => {
      LESSON_CATEGORY_IDS.forEach((categoryId) => {
        const visual = getLessonCategoryVisual(categoryId);
        expect(visual).toBeDefined();
        expect(typeof visual.emoji).toBe("string");
        expect(visual.emoji.length).toBeGreaterThan(0);
        expect(typeof visual.gradient).toBe("string");
        expect(visual.gradient.length).toBeGreaterThan(0);
      });
    });

    it("returns undefined for an invalid or unknown category ID", () => {
      // @ts-expect-error Testing invalid input for robustness
      expect(getLessonCategoryVisual("unknown-category" as LessonCategoryId)).toBeUndefined();
    });
  });
});
