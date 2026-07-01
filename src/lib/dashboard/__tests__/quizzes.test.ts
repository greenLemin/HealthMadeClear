import { describe, expect, it, vi, beforeEach } from "vitest";
import { getQuizPerformanceByCategory } from "../quizzes";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logQueryError } from "../utils";
import * as loadLessons from "@/lib/lessons/loadLessons";

vi.mock("../utils", () => ({
  logQueryError: vi.fn(),
}));

vi.mock("@/lib/lessons/loadLessons");

const mockSupabase = (data: any[] | null, error: any = null) => {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  } as unknown as SupabaseClient<any, "public", any>;
};

describe("getQuizPerformanceByCategory", () => {
  const mockLessons = [
    {
      id: "lesson1",
      categoryId: "cat1",
      category: "Category 1",
    },
    {
      id: "lesson2",
      categoryId: "cat1",
      category: "Category 1",
    },
    {
      id: "lesson3",
      categoryId: "cat2",
      category: "Category 2",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadLessons.getAllLessons).mockReturnValue(mockLessons as any);
  });

  it("should aggregate quiz performance correctly", async () => {
    const supabase = mockSupabase([
      { quiz_id: "lesson1-quiz", score: 8, max_score: 10, passed: true },
      { quiz_id: "lesson2-quiz", score: 4, max_score: 10, passed: false },
      { quiz_id: "lesson3-quiz", score: 10, max_score: 10, passed: true },
      { quiz_id: "lesson3-quiz", score: 9, max_score: 10, passed: true },
    ]);

    const result = await getQuizPerformanceByCategory(supabase, "test-user");

    expect(result).toHaveLength(2);

    // Sort logic is by attemptsCount descending. Since both have 2 attempts, the order might not be strictly deterministic in the array.from(). We can check if it contains both.
    expect(result).toEqual(
      expect.arrayContaining([
        {
          category: "Category 2",
          categoryId: "cat2",
          attemptsCount: 2,
          averageScore: 95, // (10+9) / 20 = 95%
          passRate: 100, // 2 / 2 = 100%
        },
        {
          category: "Category 1",
          categoryId: "cat1",
          attemptsCount: 2,
          averageScore: 60, // (8+4) / 20 = 60%
          passRate: 50, // 1 / 2 = 50%
        },
      ])
    );

    expect(logQueryError).toHaveBeenCalledWith("getQuizPerformanceByCategory", null);
  });

  it("should handle empty quiz data gracefully", async () => {
    const supabase = mockSupabase([]);
    const result = await getQuizPerformanceByCategory(supabase, "test-user");

    expect(result).toEqual([]);
    expect(logQueryError).toHaveBeenCalledWith("getQuizPerformanceByCategory", null);
  });

  it("should handle null quiz data and log query error", async () => {
    const error = new Error("DB Error");
    const supabase = mockSupabase(null, error);

    const result = await getQuizPerformanceByCategory(supabase, "test-user");

    expect(result).toEqual([]);
    expect(logQueryError).toHaveBeenCalledWith("getQuizPerformanceByCategory", error);
  });

  it("should handle unknown categories if quiz id doesn't map to a lesson", async () => {
    const supabase = mockSupabase([
      { quiz_id: "unknown-lesson-quiz", score: 5, max_score: 10, passed: false },
    ]);

    const result = await getQuizPerformanceByCategory(supabase, "test-user");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      category: "unknown",
      categoryId: "unknown",
      attemptsCount: 1,
      averageScore: 50,
      passRate: 0,
    });
  });
});
