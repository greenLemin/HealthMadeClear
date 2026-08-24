import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRecommendedNextLesson } from "./recommendations";
import * as loadLessons from "@/lib/lessons/loadLessons";
import * as loadPaths from "@/lib/paths/loadPaths";
import * as utils from "./utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Lesson } from "@/types/lesson";
import type { LearningPath } from "@/types/learningPath";

vi.mock("@/lib/lessons/loadLessons");
vi.mock("@/lib/paths/loadPaths");
vi.mock("./utils", () => ({
  logQueryError: vi.fn(),
}));

const mockSupabase = (data: any[], error: any = null) => {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  } as unknown as SupabaseClient<any, "public", any>;
};

describe("getRecommendedNextLesson", () => {
  const mockLessons: Lesson[] = [
    {
      id: "understanding-prescription-labels" as any,
      title: "Beginner Lesson 1",
      description: "Desc 1",
      duration: "5 min",
      level: "beginner",
      category: "cat1",
      categoryId: "intro" as any,
      content: { sections: [] },
    },
    {
      id: "asking-about-medications" as any,
      title: "Beginner Lesson 2",
      description: "Desc 2",
      duration: "10 min",
      level: "beginner",
      category: "cat1",
      categoryId: "intro" as any,
      content: { sections: [] },
    },
    {
      id: "managing-side-effects" as any,
      title: "Advanced Lesson 1",
      description: "Desc 3",
      duration: "15 min",
      level: "advanced",
      category: "cat2",
      categoryId: "intro" as any,
      content: { sections: [] },
    },
    {
      id: "advanced-lesson-2" as any,
      title: "Advanced Lesson 2",
      description: "Desc 4",
      duration: "20 min",
      level: "advanced",
      category: "cat2",
      categoryId: "intro" as any,
      content: { sections: [] },
    },
  ];

  const mockPaths: LearningPath[] = [
    {
      id: "safer-medicine-use" as any,
      title: "Path 1",
      description: "Path 1 Desc",
      duration: "1 hour",
      level: "beginner",
      icon: "icon1",
      lessons: ["understanding-prescription-labels", "asking-about-medications"],
    },
    {
      id: "path-with-missing-lesson" as any,
      title: "Path 2",
      description: "Path 2 Desc",
      duration: "1 hour",
      level: "advanced",
      icon: "icon2",
      lessons: ["managing-side-effects", "missing-lesson-id"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadLessons.getAllLessons).mockReturnValue(mockLessons);
    vi.mocked(loadPaths.getAllLearningPaths).mockReturnValue(mockPaths);
  });

  it("should return the next incomplete lesson in a partially completed path", async () => {
    const supabase = mockSupabase([{ lesson_id: "understanding-prescription-labels" }]);
    const result = await getRecommendedNextLesson(supabase, "user1");

    expect(result).toEqual({
      id: "asking-about-medications",
      title: "Beginner Lesson 2",
      description: "Desc 2",
      duration: "10 min",
      level: "beginner",
      pathTitle: "Path 1",
    });
  });

  it("should handle partially completed path where next lesson is missing from lessonRecord", async () => {
    // Complete all beginner lessons so it moves past Path 1 and default beginner behavior
    const supabase = mockSupabase([
      { lesson_id: "understanding-prescription-labels" },
      { lesson_id: "asking-about-medications" },
      { lesson_id: "managing-side-effects" }, // Path 2 completed part
    ]);
    const result = await getRecommendedNextLesson(supabase, "user1");

    // "missing-lesson-id" is next in Path 2 but not in lessons.
    // So it should fallback to the first uncompleted lesson which is "advanced-lesson-2"
    expect(result).toEqual({
      id: "advanced-lesson-2",
      title: "Advanced Lesson 2",
      description: "Desc 4",
      duration: "20 min",
      level: "advanced",
    });
  });

  it("should return the first beginner lesson if no paths are partially completed", async () => {
    // Neither lesson1 nor lesson2 are completed, so path is not partially completed
    const supabase = mockSupabase([]);
    const result = await getRecommendedNextLesson(supabase, "user1");

    expect(result).toEqual({
      id: "understanding-prescription-labels",
      title: "Beginner Lesson 1",
      description: "Desc 1",
      duration: "5 min",
      level: "beginner",
    });
  });

  it("should return the first available lesson if no beginner lessons are available", async () => {
    // Complete all beginner lessons
    const supabase = mockSupabase([
      { lesson_id: "understanding-prescription-labels" },
      { lesson_id: "asking-about-medications" },
    ]);
    const result = await getRecommendedNextLesson(supabase, "user1");

    // It will find managing-side-effects as firstUncompleted, and also advanced-lesson-2 is uncompleted,
    // which tests the !firstUncompleted branch.
    expect(result).toEqual({
      id: "managing-side-effects",
      title: "Advanced Lesson 1",
      description: "Desc 3",
      duration: "15 min",
      level: "advanced",
    });
  });

  it("should return null if all lessons are completed", async () => {
    const supabase = mockSupabase([
      { lesson_id: "understanding-prescription-labels" },
      { lesson_id: "asking-about-medications" },
      { lesson_id: "managing-side-effects" },
      { lesson_id: "advanced-lesson-2" },
    ]);
    const result = await getRecommendedNextLesson(supabase, "user1");

    expect(result).toBeNull();
  });

  it("prefers a beginner lesson even when an advanced lesson comes first", async () => {
    // Ordering matters: the advanced lesson is the first uncompleted one, but a
    // beginner lesson exists later in the list. The fallback scan must keep
    // going rather than settling for the advanced lesson.
    vi.mocked(loadLessons.getAllLessons).mockReturnValue([
      mockLessons[2]!, // advanced, uncompleted, appears first
      mockLessons[1]!, // beginner, uncompleted, appears later
    ]);
    vi.mocked(loadPaths.getAllLearningPaths).mockReturnValue([]);

    const result = await getRecommendedNextLesson(mockSupabase([]), "user1");

    expect(result).toEqual({
      id: "asking-about-medications",
      title: "Beginner Lesson 2",
      description: "Desc 2",
      duration: "10 min",
      level: "beginner",
    });
  });

  it("falls back to the first uncompleted lesson when no beginner lesson remains", async () => {
    vi.mocked(loadLessons.getAllLessons).mockReturnValue([mockLessons[2]!, mockLessons[1]!]);
    vi.mocked(loadPaths.getAllLearningPaths).mockReturnValue([]);

    const result = await getRecommendedNextLesson(
      mockSupabase([{ lesson_id: "asking-about-medications" }]),
      "user1"
    );

    expect(result).toEqual({
      id: "managing-side-effects",
      title: "Advanced Lesson 1",
      description: "Desc 3",
      duration: "15 min",
      level: "advanced",
    });
  });

  it("should log query error if supabase returns an error", async () => {
    const error = new Error("Database error");
    const supabase = mockSupabase([], error);

    await getRecommendedNextLesson(supabase, "user1");

    expect(utils.logQueryError).toHaveBeenCalledWith("getRecommendedNextLesson", error);
  });

  it("should gracefully handle null progressData", async () => {
    const supabase = mockSupabase(null as any);
    const result = await getRecommendedNextLesson(supabase, "user1");

    // Defaults to empty progress, so returns first beginner lesson
    expect(result).toEqual({
      id: "understanding-prescription-labels",
      title: "Beginner Lesson 1",
      description: "Desc 1",
      duration: "5 min",
      level: "beginner",
    });
  });
});
