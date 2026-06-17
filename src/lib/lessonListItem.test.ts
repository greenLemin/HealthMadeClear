import { describe, it, expect } from "vitest";
import { toLessonListItems } from "./lessonListItem";
import type { Lesson } from "@/types/lesson";
import type { LessonId, LessonCategoryId } from "@/types/content";

describe("toLessonListItems", () => {
  it("should return an empty array when given an empty array", () => {
    expect(toLessonListItems([])).toEqual([]);
  });

  it("should correctly map full Lesson objects", () => {
    const lessons: Lesson[] = [
      {
        id: "understanding-prescription-labels" as LessonId,
        title: "Test Lesson",
        description: "A test lesson",
        category: "Test Category",
        categoryId: "medication-safety" as LessonCategoryId,
        duration: "10 mins",
        level: "beginner",
        image: "/test.jpg",
        imageAlt: "Test image",
        estimatedMinutes: 10,
        wordCount: 500,
        // fields that should be omitted
        content: { sections: [] },
        lastReviewed: "2023-01-01",
        reviewedBy: "Test Author",
        publishedAt: "2023-01-01",
        updatedAt: "2023-01-01",
        relatedLessonIds: [],
        learningPathIds: [],
        sources: [],
        sidebarTips: [],
        sidebarTitle: "",
        keyTakeaways: [],
      },
      {
        id: "asking-about-medications" as LessonId,
        title: "Another Test Lesson",
        description: "Another test lesson",
        category: "Test Category 2",
        categoryId: "doctor-visits" as LessonCategoryId,
        duration: "20 mins",
        level: "advanced",
        image: "/test2.jpg",
        imageAlt: "Test image 2",
        estimatedMinutes: 20,
        wordCount: 1000,
        // fields that should be omitted
        content: { sections: [] },
      },
    ];

    const result = toLessonListItems(lessons);

    expect(result).toEqual([
      {
        id: "understanding-prescription-labels",
        title: "Test Lesson",
        description: "A test lesson",
        category: "Test Category",
        categoryId: "medication-safety",
        duration: "10 mins",
        level: "beginner",
        image: "/test.jpg",
        imageAlt: "Test image",
        estimatedMinutes: 10,
        wordCount: 500,
      },
      {
        id: "asking-about-medications",
        title: "Another Test Lesson",
        description: "Another test lesson",
        category: "Test Category 2",
        categoryId: "doctor-visits",
        duration: "20 mins",
        level: "advanced",
        image: "/test2.jpg",
        imageAlt: "Test image 2",
        estimatedMinutes: 20,
        wordCount: 1000,
      },
    ]);
  });

  it("should map Lesson objects correctly when optional fields are missing", () => {
    const lessons: Lesson[] = [
      {
        id: "managing-side-effects" as LessonId,
        title: "Minimal Lesson",
        description: "Minimal test lesson",
        category: "Minimal Category",
        categoryId: "chronic-conditions" as LessonCategoryId,
        duration: "5 mins",
        level: "intermediate",
        // missing optional fields: image, imageAlt, estimatedMinutes, wordCount
        content: { sections: [] },
      },
    ];

    const result = toLessonListItems(lessons);

    expect(result).toEqual([
      {
        id: "managing-side-effects",
        title: "Minimal Lesson",
        description: "Minimal test lesson",
        category: "Minimal Category",
        categoryId: "chronic-conditions",
        duration: "5 mins",
        level: "intermediate",
        image: undefined,
        imageAlt: undefined,
        estimatedMinutes: undefined,
        wordCount: undefined,
      },
    ]);
  });
});
