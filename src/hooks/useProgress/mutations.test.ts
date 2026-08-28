// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useProgressMutations } from "./mutations";
import {
  markLessonComplete as guestMarkLessonComplete,
  saveQuizAttempt as guestSaveQuizAttempt,
} from "@/lib/guestProgress";
import { handleLessonCompletionSideEffects, handleQuizAttemptSideEffects } from "./sideEffects";
import { QUIZ_ATTEMPTS_ON_CONFLICT } from "@/lib/supabase/schema";
import type { QuizAttempts } from "./supabaseProgress";
import type { User } from "@supabase/supabase-js";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace: string) => {
    return (key: string, values?: { title?: string; count?: number }) => {
      if (namespace === "achievements") {
        if (key === "unlocked") return `Achievement unlocked: ${values?.title}`;
        if (key === "items.first-lesson.title") return "First Step";
        if (key === "items.first-lesson.description") return "Completed your first lesson";
        return key;
      }
      if (namespace === "progress") {
        if (key === "pathAlmostThere") {
          return `You're one lesson away from completing "${values?.title}".`;
        }
        if (key === "streakMilestoneTitle") return `${values?.count}-Day Streak!`;
        if (key === "streakMilestoneBody") {
          return `You're on a ${values?.count}-day learning streak. Keep it up!`;
        }
        const map: Record<string, string> = {
          saveError: "Failed to save progress",
          quizSaveError: "Failed to save quiz result",
          pathAlmostThereTitle: "Almost there!",
          sessionExpired: "Your session has expired. Please log in again.",
        };
        return map[key] ?? key;
      }
      return key;
    };
  }),
}));

vi.mock("@/lib/guestProgress", () => ({
  markLessonComplete: vi.fn(),
  saveQuizAttempt: vi.fn(),
}));

vi.mock("./sideEffects", () => ({
  handleLessonCompletionSideEffects: vi.fn(() => Promise.resolve()),
  handleQuizAttemptSideEffects: vi.fn(() => Promise.resolve()),
}));

describe("useProgressMutations", () => {
  let mockShowToast: any;
  let mockSetSupabaseCompletedLessonIds: any;
  let mockSetSupabaseQuizAttempts: any;
  let mockAppStateMarkLessonComplete: any;
  let mockRecordQuizScore: any;
  let mockSupabase: any;
  let mockLessonProgressTable: any;
  let mockQuizAttemptsTable: any;

  const mockUser = { id: "user-123" } as User;

  function renderMutations(user: User | null, completed: string[] = [], quizAttempts: QuizAttempts = {}) {
    return renderHook(() =>
      useProgressMutations(
        user,
        mockSupabase as never,
        mockShowToast,
        completed,
        mockSetSupabaseCompletedLessonIds,
        quizAttempts,
        mockSetSupabaseQuizAttempts,
        mockAppStateMarkLessonComplete,
        mockRecordQuizScore,
        "en"
      )
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();

    mockShowToast = vi.fn();
    mockSetSupabaseCompletedLessonIds = vi.fn();
    mockSetSupabaseQuizAttempts = vi.fn();
    mockAppStateMarkLessonComplete = vi.fn();
    mockRecordQuizScore = vi.fn();

    mockLessonProgressTable = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockQuizAttemptsTable = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") return mockLessonProgressTable;
        if (table === "quiz_attempts") return mockQuizAttemptsTable;
        return {};
      }),
    };
  });

  describe("Guest Mode (user is null)", () => {
    it("should invoke guest storage and appState callback for markLessonComplete", async () => {
      const { result } = renderMutations(null);

      await act(async () => {
        await result.current.markLessonComplete("lesson-guest-1");
      });

      expect(guestMarkLessonComplete).toHaveBeenCalledWith("lesson-guest-1");
      expect(mockAppStateMarkLessonComplete).toHaveBeenCalledWith("lesson-guest-1");
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(mockSetSupabaseCompletedLessonIds).not.toHaveBeenCalled();
    });

    it("should persist counts and record UI percent for saveQuizAttempt", async () => {
      const { result } = renderMutations(null);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 7, 10, [1, 2]);
      });

      expect(guestSaveQuizAttempt).toHaveBeenCalledWith("quiz-1", 7, 10);
      expect(mockRecordQuizScore).toHaveBeenCalledWith("lesson-1", 70, true);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-2", "lesson-2", 6, 10, [1]);
      });

      expect(guestSaveQuizAttempt).toHaveBeenCalledWith("quiz-2", 6, 10);
      expect(mockRecordQuizScore).toHaveBeenCalledWith("lesson-2", 60, false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated Mode - markLessonComplete", () => {
    it("should optimistically update state, call Supabase upsert, and invoke side effects on success", async () => {
      const { result } = renderMutations(mockUser, ["existing-lesson"]);

      await act(async () => {
        await result.current.markLessonComplete("new-lesson");
      });

      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenCalledWith(["existing-lesson", "new-lesson"]);
      expect(mockSupabase.from).toHaveBeenCalledWith("lesson_progress");

      expect(mockLessonProgressTable.upsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          lesson_id: "new-lesson",
          completed: true,
          completed_at: expect.any(String),
        },
        { onConflict: "user_id,lesson_id" }
      );

      expect(handleLessonCompletionSideEffects).toHaveBeenCalledWith(
        mockSupabase,
        "user-123",
        "new-lesson",
        ["existing-lesson", "new-lesson"],
        mockShowToast,
        "en",
        expect.any(Function),
        expect.objectContaining({
          pathAlmostThereTitle: "Almost there!",
        })
      );

      const localize = vi.mocked(handleLessonCompletionSideEffects).mock.calls.at(0)?.at(6);
      expect(localize).toEqual(expect.any(Function));
      expect((localize as (id: string) => { unlocked: string })("first-lesson").unlocked).toBe(
        "Achievement unlocked: First Step"
      );
    });

    it("should avoid adding duplicate lesson ID if already present in state", async () => {
      const { result } = renderMutations(mockUser, ["lesson-1"]);

      await act(async () => {
        await result.current.markLessonComplete("lesson-1");
      });

      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenCalledWith(["lesson-1"]);
    });

    it("should rollback optimistic state and show toast error when Supabase upsert fails", async () => {
      mockLessonProgressTable.upsert.mockResolvedValueOnce({ error: new Error("DB Upsert Error") });

      const { result } = renderMutations(mockUser, ["existing-lesson"]);

      await act(async () => {
        await result.current.markLessonComplete("failed-lesson");
      });

      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenNthCalledWith(1, [
        "existing-lesson",
        "failed-lesson",
      ]);

      expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to save progress");

      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenNthCalledWith(2, ["existing-lesson"]);
      expect(handleLessonCompletionSideEffects).not.toHaveBeenCalled();
    });

    it("shows session-expired copy and rolls back when lesson upsert returns an expired JWT", async () => {
      mockLessonProgressTable.upsert.mockResolvedValueOnce({
        error: { status: 401, message: "JWT expired" },
      });

      const { result } = renderMutations(mockUser, ["existing-lesson"]);

      await act(async () => {
        await result.current.markLessonComplete("failed-lesson");
      });

      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenNthCalledWith(1, [
        "existing-lesson",
        "failed-lesson",
      ]);
      expect(mockShowToast).toHaveBeenCalledWith("error", "Your session has expired. Please log in again.");
      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenNthCalledWith(2, ["existing-lesson"]);
      expect(handleLessonCompletionSideEffects).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated Mode - saveQuizAttempt", () => {
    it("should update quiz attempts optimistically and upsert into Supabase on success", async () => {
      const { result } = renderMutations(mockUser, ["lesson-1"]);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 4, 5, [0, 1]);
      });

      expect(mockSetSupabaseQuizAttempts).toHaveBeenCalledWith({
        "quiz-1": { score: 4, maxScore: 5, passed: true },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("quiz_attempts");
      expect(mockQuizAttemptsTable.upsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          quiz_id: "quiz-1",
          score: 4,
          max_score: 5,
          passed: true,
          answers: [0, 1],
        },
        { onConflict: QUIZ_ATTEMPTS_ON_CONFLICT, ignoreDuplicates: false }
      );
      expect(mockQuizAttemptsTable).not.toHaveProperty("insert");

      expect(handleQuizAttemptSideEffects).toHaveBeenCalledWith(
        mockSupabase,
        "user-123",
        "lesson-1",
        4,
        5,
        true,
        ["lesson-1"],
        mockShowToast,
        "en",
        expect.any(Function),
        expect.objectContaining({
          pathAlmostThereTitle: "Almost there!",
        })
      );

      const localize = vi.mocked(handleQuizAttemptSideEffects).mock.calls.at(0)?.at(9);
      expect(localize).toEqual(expect.any(Function));
      expect((localize as (id: string) => { unlocked: string })("first-lesson").unlocked).toBe(
        "Achievement unlocked: First Step"
      );
    });

    it("treats 4/5 as passed and 1/5 as failed; never uses 80 >= 5 * 0.7", async () => {
      const { result } = renderMutations(mockUser);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 1, 5, [1]);
      });

      expect(mockQuizAttemptsTable.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ score: 1, max_score: 5, passed: false }),
        expect.any(Object)
      );

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-2", "lesson-2", 80, 5, [1]);
      });

      expect(mockQuizAttemptsTable.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ quiz_id: "quiz-2", score: 4, max_score: 5, passed: true }),
        expect.any(Object)
      );
    });

    it("skips upsert on lower or equal score and still runs side effects with locale", async () => {
      const existing: QuizAttempts = {
        "quiz-1": { score: 4, maxScore: 5, passed: true },
      };
      const { result } = renderMutations(mockUser, ["lesson-1"], existing);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 3, 5, [1]);
      });

      expect(mockQuizAttemptsTable.upsert).not.toHaveBeenCalled();
      expect(mockSetSupabaseQuizAttempts).not.toHaveBeenCalled();
      expect(handleQuizAttemptSideEffects).toHaveBeenCalledWith(
        mockSupabase,
        "user-123",
        "lesson-1",
        3,
        5,
        false,
        ["lesson-1"],
        mockShowToast,
        "en",
        expect.any(Function),
        expect.any(Object)
      );
      expect(mockShowToast).not.toHaveBeenCalled();

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 4, 5, [1]);
      });

      expect(mockQuizAttemptsTable.upsert).not.toHaveBeenCalled();
      expect(handleQuizAttemptSideEffects).toHaveBeenCalledTimes(2);

      const localize = vi.mocked(handleQuizAttemptSideEffects).mock.calls.at(0)?.at(9);
      expect(localize).toEqual(expect.any(Function));
      expect((localize as (id: string) => { unlocked: string })("first-lesson").unlocked).toBe(
        "Achievement unlocked: First Step"
      );
    });

    it("should append current lessonId to sideEffects completedIds list if missing from ref", async () => {
      const { result } = renderMutations(mockUser, ["lesson-completed"]);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-not-completed", 5, 5, [1, 2]);
      });

      expect(handleQuizAttemptSideEffects).toHaveBeenCalledWith(
        mockSupabase,
        "user-123",
        "lesson-not-completed",
        5,
        5,
        true,
        ["lesson-completed", "lesson-not-completed"],
        mockShowToast,
        "en",
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("should restore previous best score and skip side effects when upsert fails", async () => {
      mockQuizAttemptsTable.upsert.mockResolvedValueOnce({ error: new Error("DB Upsert Error") });
      const prev: QuizAttempts = {
        "quiz-1": { score: 2, maxScore: 5, passed: false },
      };
      const { result } = renderMutations(mockUser, ["lesson-1"], prev);

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 4, 5, [1, 2]);
      });

      expect(mockSetSupabaseQuizAttempts).toHaveBeenNthCalledWith(1, {
        "quiz-1": { score: 4, maxScore: 5, passed: true },
      });
      expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to save quiz result");
      expect(mockSetSupabaseQuizAttempts).toHaveBeenNthCalledWith(2, prev);
      expect(handleQuizAttemptSideEffects).not.toHaveBeenCalled();
    });
  });
});
