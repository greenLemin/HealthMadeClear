import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserProgressSummary, getCompletedLessonsPaginated } from "../progress";
import { logQueryError } from "../utils";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/lessons/loadLessons", () => ({
  getAllLessons: vi.fn(() => [
    { id: "lesson-a", title: "Lesson A", category: "Insurance", categoryId: "insurance" },
    { id: "lesson-b", title: "Lesson B", category: "Meds", categoryId: "medications" },
  ]),
}));

vi.mock("../utils", () => ({
  logQueryError: vi.fn(),
}));

// Lesson chain: from(table).select().eq("user_id", x).eq("completed", true) -> resolves
function buildLessonChain(resolved: { data: unknown; error: unknown }) {
  const eqCompleted = vi.fn().mockResolvedValue(resolved);
  const eqUser = vi.fn().mockReturnValue({ eq: eqCompleted });
  const select = vi.fn().mockReturnValue({ eq: eqUser });
  return { select, eqUser, eqCompleted };
}

// Quiz chain: from(table).select().eq("user_id", x) -> resolves
function buildQuizChain(resolved: { data: unknown; error: unknown }) {
  const eqUser = vi.fn().mockResolvedValue(resolved);
  const select = vi.fn().mockReturnValue({ eq: eqUser });
  return { select, eqUser };
}

// Streak chain: from(table).select().eq("user_id", x).single() -> resolves
function buildStreakChain(resolved: { data: unknown; error: unknown }) {
  const single = vi.fn().mockResolvedValue(resolved);
  const eqUser = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq: eqUser });
  return { select, eqUser, single };
}

describe("getUserProgressSummary", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates lessons, quizzes, and streak into summary", async () => {
    const lesson = buildLessonChain({
      data: [
        { lesson_id: "lesson-a", time_spent_seconds: 1200 },
        { lesson_id: "lesson-a", time_spent_seconds: 600 },
        { lesson_id: "lesson-b", time_spent_seconds: 1800 },
      ],
      error: null,
    });
    const quiz = buildQuizChain({
      data: [
        { quiz_id: "lesson-a-quiz", score: 6, max_score: 10, passed: true },
        { quiz_id: "lesson-b-quiz", score: 8, max_score: 10, passed: true },
        { quiz_id: "lesson-b-quiz", score: 2, max_score: 10, passed: false },
      ],
      error: null,
    });
    const streak = buildStreakChain({ data: { current_streak: 3, longest_streak: 7 }, error: null });

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return { select: lesson.select };
        if (table === "quiz_attempts") return { select: quiz.select };
        if (table === "streaks") return { select: streak.select };
        return { select: vi.fn() };
      }),
    };

    const summary = await getUserProgressSummary(mockSupabase as unknown as SupabaseClient, "user1");

    expect(summary.totalLessonsCompleted).toBe(2); // dedupe by lesson_id set
    expect(summary.totalLessonsAvailable).toBe(2);
    expect(summary.totalQuizzesPassed).toBe(2);
    expect(summary.totalQuizzesAttempted).toBe(3);
    expect(summary.averageQuizScore).toBe(Math.round(((6 + 8 + 2) / (10 + 10 + 10)) * 100));
    expect(summary.totalTimeSpentMinutes).toBe(Math.round((1200 + 600 + 1800) / 60));
    expect(summary.currentStreak).toBe(3);
    expect(summary.longestStreak).toBe(7);

    expect(logQueryError).toHaveBeenCalledWith("getUserProgressSummary:lessons", null);
    expect(logQueryError).toHaveBeenCalledWith("getUserProgressSummary:quizzes", null);
    expect(logQueryError).toHaveBeenCalledWith("getUserProgressSummary:streak", null);
  });

  it("tolerates null data with zeroed summary", async () => {
    const lessonNull = buildLessonChain({ data: null, error: null });
    const quizNull = buildQuizChain({ data: null, error: null });
    const streakNull = buildStreakChain({ data: null, error: null });

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return { select: lessonNull.select };
        if (table === "quiz_attempts") return { select: quizNull.select };
        if (table === "streaks") return { select: streakNull.select };
        return { select: vi.fn() };
      }),
    };

    const summary = await getUserProgressSummary(mockSupabase as unknown as SupabaseClient, "user1");

    expect(summary.totalLessonsCompleted).toBe(0);
    expect(summary.totalQuizzesPassed).toBe(0);
    expect(summary.totalQuizzesAttempted).toBe(0);
    expect(summary.averageQuizScore).toBe(0);
    expect(summary.totalTimeSpentMinutes).toBe(0);
    expect(summary.currentStreak).toBe(0);
    expect(summary.longestStreak).toBe(0);
  });

  it("reports errors via logQueryError", async () => {
    const lessonErr = new Error("lesson fail");
    const quizErr = new Error("quiz fail");
    const streakErr = new Error("streak fail");

    const lesson = buildLessonChain({
      data: [{ lesson_id: "lesson-a", time_spent_seconds: 0 }],
      error: lessonErr,
    });
    const quiz = buildQuizChain({ data: null, error: quizErr });
    const streak = buildStreakChain({ data: null, error: streakErr });

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return { select: lesson.select };
        if (table === "quiz_attempts") return { select: quiz.select };
        if (table === "streaks") return { select: streak.select };
        return { select: vi.fn() };
      }),
    };

    await getUserProgressSummary(mockSupabase as unknown as SupabaseClient, "user1");

    expect(logQueryError).toHaveBeenCalledWith("getUserProgressSummary:lessons", lessonErr);
    expect(logQueryError).toHaveBeenCalledWith("getUserProgressSummary:quizzes", quizErr);
    expect(logQueryError).toHaveBeenCalledWith("getUserProgressSummary:streak", streakErr);
  });
});

describe("getCompletedLessonsPaginated", () => {
  let mockSupabase: any;

  // Progress: from.select(..., {count}).eq("user_id", x).eq("completed", true).order("completed_at", ...).range(from, to) -> resolves
  function buildProgressChain(resolved: { data: unknown; count: number | null; error: unknown }) {
    const range = vi.fn().mockResolvedValue(resolved);
    const order = vi.fn().mockReturnValue({ range });
    const eqCompleted = vi.fn().mockReturnValue({ order });
    const eqUser = vi.fn().mockReturnValue({ eq: eqCompleted });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    return { select, range };
  }

  // Quiz: from.select().eq("user_id", x).in("quiz_id", [...]) -> resolves
  function buildQuizInChain(resolved: { data: unknown; error: unknown }) {
    const inFn = vi.fn().mockResolvedValue(resolved);
    const eqUser = vi.fn().mockReturnValue({ in: inFn });
    const select = vi.fn().mockReturnValue({ eq: eqUser });
    return { select, inFn };
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated completed lessons joined with best quiz score", async () => {
    const progress = buildProgressChain({
      data: [
        { lesson_id: "lesson-a", completed_at: "2024-01-02T00:00:00Z" },
        { lesson_id: "lesson-b", completed_at: "2024-01-01T00:00:00Z" },
      ],
      count: 2,
      error: null,
    });
    const quizzes = buildQuizInChain({
      data: [
        { quiz_id: "lesson-a-quiz", score: 7, max_score: 10 },
        { quiz_id: "lesson-a-quiz", score: 9, max_score: 10 },
        { quiz_id: "lesson-b-quiz", score: 5, max_score: 10 },
      ],
      error: null,
    });

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return { select: progress.select };
        if (table === "quiz_attempts") return { select: quizzes.select };
        return { select: vi.fn() };
      }),
    };

    const result = await getCompletedLessonsPaginated(
      mockSupabase as unknown as SupabaseClient,
      "user1",
      "en",
      1,
      10
    );

    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.lessons).toHaveLength(2);

    const lessonA = result.lessons.find((l) => l.lessonId === "lesson-a");
    expect(lessonA?.title).toBe("Lesson A");
    expect(lessonA?.quizScore).toBe(90); // best of 70% and 90%

    const lessonB = result.lessons.find((l) => l.lessonId === "lesson-b");
    expect(lessonB?.quizScore).toBe(50);
  });

  it("returns empty page when no progress and count is null", async () => {
    const progress = buildProgressChain({ data: null, count: null, error: null });
    mockSupabase = {
      from: vi.fn(() => ({ select: progress.select })),
    };

    const result = await getCompletedLessonsPaginated(
      mockSupabase as unknown as SupabaseClient,
      "user1",
      "en",
      2,
      5
    );

    expect(result.lessons).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.page).toBe(2);
  });

  it("preserves lessonId entry even when no matching lesson metadata exists", async () => {
    const progress = buildProgressChain({
      data: [{ lesson_id: "ghost-lesson", completed_at: "2024-03-01T00:00:00Z" }],
      count: 1,
      error: null,
    });
    const quizzes = buildQuizInChain({ data: [], error: null });

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return { select: progress.select };
        if (table === "quiz_attempts") return { select: quizzes.select };
        return { select: vi.fn() };
      }),
    };

    const result = await getCompletedLessonsPaginated(
      mockSupabase as unknown as SupabaseClient,
      "user1",
      "en",
      1,
      10
    );

    expect(result.lessons).toHaveLength(1);
    expect(result.lessons[0].title).toBe("Unknown Lesson");
    expect(result.lessons[0].category).toBe("");
    expect(result.lessons[0].categoryId).toBe("");
    expect(result.lessons[0].quizScore).toBeNull();
  });
});
