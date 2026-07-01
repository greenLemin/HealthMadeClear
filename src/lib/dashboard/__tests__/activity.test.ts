import { describe, it, expect, vi, beforeEach } from "vitest";
import { getRecentActivity } from "../activity";
import * as loadLessons from "@/lib/lessons/loadLessons";
import * as utils from "../utils";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/lessons/loadLessons");
vi.mock("../utils", () => ({
  logQueryError: vi.fn(),
}));

describe("getRecentActivity", () => {
  const mockLessons = [
    {
      id: "lesson-1",
      title: "First Lesson",
    },
    {
      id: "lesson-2",
      title: "Second Lesson",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadLessons.getAllLessons).mockReturnValue(mockLessons as any);
  });

  const createMockBuilder = (data: any, error: any = null) => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      then: (resolve: any) => resolve({ data, error }),
    };
    return builder;
  };

  it("should merge, format, and sort lessons and quizzes", async () => {
    const mockLessonBuilder = createMockBuilder([
      { lesson_id: "lesson-1", completed_at: "2023-10-02T10:00:00Z" },
      { lesson_id: "lesson-3", completed_at: "2023-10-01T10:00:00Z" }, // unknown lesson
    ]);

    const mockQuizBuilder = createMockBuilder([
      {
        quiz_id: "lesson-2-quiz",
        score: 8,
        max_score: 10,
        passed: true,
        attempted_at: "2023-10-03T10:00:00Z",
      },
    ]);

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return mockLessonBuilder;
        if (table === "quiz_attempts") return mockQuizBuilder;
        return null;
      }),
    } as unknown as SupabaseClient<any, "public", any>;

    const result = await getRecentActivity(mockSupabase, "user1");

    expect(mockSupabase.from).toHaveBeenCalledWith("lesson_progress");
    expect(mockSupabase.from).toHaveBeenCalledWith("quiz_attempts");

    expect(result).toHaveLength(3);

    // Sort order: newest first
    expect(result[0]).toEqual({
      type: "quiz",
      lessonId: "lesson-2",
      quizId: "lesson-2-quiz",
      title: "Quiz: Second Lesson",
      completedAt: "2023-10-03T10:00:00Z",
      score: 80,
      passed: true,
    });

    expect(result[1]).toEqual({
      type: "lesson",
      lessonId: "lesson-1",
      title: "First Lesson",
      completedAt: "2023-10-02T10:00:00Z",
    });

    expect(result[2]).toEqual({
      type: "lesson",
      lessonId: "lesson-3",
      title: "Unknown Lesson",
      completedAt: "2023-10-01T10:00:00Z",
    });

    expect(utils.logQueryError).toHaveBeenCalledWith("getRecentActivity:lessons", null);
    expect(utils.logQueryError).toHaveBeenCalledWith("getRecentActivity:quizzes", null);
  });

  it("should limit the output to top 5 recent activities", async () => {
    const mockLessonBuilder = createMockBuilder([
      { lesson_id: "lesson-1", completed_at: "2023-10-06T10:00:00Z" },
      { lesson_id: "lesson-1", completed_at: "2023-10-04T10:00:00Z" },
      { lesson_id: "lesson-1", completed_at: "2023-10-02T10:00:00Z" },
    ]);

    const mockQuizBuilder = createMockBuilder([
      {
        quiz_id: "lesson-2-quiz",
        score: 0,
        max_score: 0,
        passed: false,
        attempted_at: "2023-10-05T10:00:00Z",
      },
      {
        quiz_id: "lesson-2-quiz",
        score: 5,
        max_score: 10,
        passed: false,
        attempted_at: "2023-10-03T10:00:00Z",
      },
      {
        quiz_id: "lesson-2-quiz",
        score: 10,
        max_score: 10,
        passed: true,
        attempted_at: "2023-10-01T10:00:00Z",
      },
    ]);

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return mockLessonBuilder;
        if (table === "quiz_attempts") return mockQuizBuilder;
        return null;
      }),
    } as unknown as SupabaseClient<any, "public", any>;

    const result = await getRecentActivity(mockSupabase, "user1");

    expect(result).toHaveLength(5);
    expect(result[0].completedAt).toBe("2023-10-06T10:00:00Z"); // Lesson
    expect(result[1].completedAt).toBe("2023-10-05T10:00:00Z"); // Quiz
    expect(result[2].completedAt).toBe("2023-10-04T10:00:00Z"); // Lesson
    expect(result[3].completedAt).toBe("2023-10-03T10:00:00Z"); // Quiz
    expect(result[4].completedAt).toBe("2023-10-02T10:00:00Z"); // Lesson

    // check max_score 0 edge case
    expect(result[1].score).toBe(0);
  });

  it("should handle null data and log errors correctly", async () => {
    const errorLesson = new Error("Lesson Error");
    const errorQuiz = new Error("Quiz Error");

    const mockLessonBuilder = createMockBuilder(null, errorLesson);
    const mockQuizBuilder = createMockBuilder(null, errorQuiz);

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return mockLessonBuilder;
        if (table === "quiz_attempts") return mockQuizBuilder;
        return null;
      }),
    } as unknown as SupabaseClient<any, "public", any>;

    const result = await getRecentActivity(mockSupabase, "user1");

    expect(result).toEqual([]);
    expect(utils.logQueryError).toHaveBeenCalledWith("getRecentActivity:lessons", errorLesson);
    expect(utils.logQueryError).toHaveBeenCalledWith("getRecentActivity:quizzes", errorQuiz);
  });
});
