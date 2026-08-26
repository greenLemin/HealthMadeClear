// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useProgressMutations } from "./mutations";
import {
  markLessonComplete as guestMarkLessonComplete,
  saveQuizAttempt as guestSaveQuizAttempt,
} from "@/lib/guestProgress";
import { handleLessonCompletionSideEffects, handleQuizAttemptSideEffects } from "./sideEffects";
import type { QuizAttempts } from "./supabaseProgress";
import type { User } from "@supabase/supabase-js";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const map: Record<string, string> = {
      saveError: "Failed to save progress",
      quizSaveError: "Failed to save quiz result",
    };
    return map[key] ?? key;
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
      insert: vi.fn().mockResolvedValue({ error: null }),
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
      const { result } = renderHook(() =>
        useProgressMutations(
          null,
          mockSupabase,
          mockShowToast,
          [],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.markLessonComplete("lesson-guest-1");
      });

      expect(guestMarkLessonComplete).toHaveBeenCalledWith("lesson-guest-1");
      expect(mockAppStateMarkLessonComplete).toHaveBeenCalledWith("lesson-guest-1");
      expect(mockSupabase.from).not.toHaveBeenCalled();
      expect(mockSetSupabaseCompletedLessonIds).not.toHaveBeenCalled();
    });

    it("should calculate pass status and invoke guest functions for saveQuizAttempt", async () => {
      const { result } = renderHook(() =>
        useProgressMutations(
          null,
          mockSupabase,
          mockShowToast,
          [],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      // Score 7 out of 10 -> passed = true (>= 70%)
      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 7, 10, [1, 2]);
      });

      expect(guestSaveQuizAttempt).toHaveBeenCalledWith("quiz-1", 7, 10);
      expect(mockRecordQuizScore).toHaveBeenCalledWith("lesson-1", 7, true);

      // Score 6 out of 10 -> passed = false (< 70%)
      await act(async () => {
        await result.current.saveQuizAttempt("quiz-2", "lesson-2", 6, 10, [1]);
      });

      expect(guestSaveQuizAttempt).toHaveBeenCalledWith("quiz-2", 6, 10);
      expect(mockRecordQuizScore).toHaveBeenCalledWith("lesson-2", 6, false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated Mode - markLessonComplete", () => {
    it("should optimistically update state, call Supabase upsert, and invoke side effects on success", async () => {
      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          ["existing-lesson"],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

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
        "en"
      );
    });

    it("should avoid adding duplicate lesson ID if already present in state", async () => {
      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          ["lesson-1"],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.markLessonComplete("lesson-1");
      });

      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenCalledWith(["lesson-1"]);
    });

    it("should rollback optimistic state and show toast error when Supabase upsert fails", async () => {
      mockLessonProgressTable.upsert.mockResolvedValueOnce({ error: new Error("DB Upsert Error") });

      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          ["existing-lesson"],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.markLessonComplete("failed-lesson");
      });

      // First optimistic update
      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenNthCalledWith(1, [
        "existing-lesson",
        "failed-lesson",
      ]);

      // Error toast shown
      expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to save progress");

      // Rollback call to setSupabaseCompletedLessonIds excluding failed-lesson
      expect(mockSetSupabaseCompletedLessonIds).toHaveBeenNthCalledWith(2, ["existing-lesson"]);
      expect(handleLessonCompletionSideEffects).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated Mode - saveQuizAttempt", () => {
    it("should update quiz attempts optimistically and insert into Supabase on success", async () => {
      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          ["lesson-1"],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 8, 10, [0, 1]);
      });

      expect(mockSetSupabaseQuizAttempts).toHaveBeenCalledWith(expect.any(Function));

      // Test state update function passed to setSupabaseQuizAttempts for new attempt
      const updateFn = mockSetSupabaseQuizAttempts.mock.calls[0][0];
      const nextState = updateFn({});
      expect(nextState).toEqual({
        "quiz-1": { score: 8, maxScore: 10, passed: true },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("quiz_attempts");
      expect(mockQuizAttemptsTable.insert).toHaveBeenCalledWith({
        user_id: "user-123",
        quiz_id: "quiz-1",
        score: 8,
        max_score: 10,
        passed: true,
        answers: [0, 1],
      });

      expect(handleQuizAttemptSideEffects).toHaveBeenCalledWith(
        mockSupabase,
        "user-123",
        "lesson-1",
        8,
        10,
        true,
        ["lesson-1"],
        mockShowToast
      );
    });

    it("should keep best score via Math.max in optimistic update logic", async () => {
      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          [],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 5, 10, [1]);
      });

      const updateFn = mockSetSupabaseQuizAttempts.mock.calls[0][0];

      // Existing attempt with higher score (8) should be preserved unchanged
      const prevState: QuizAttempts = {
        "quiz-1": { score: 8, maxScore: 10, passed: true },
      };
      const resultState = updateFn(prevState);
      expect(resultState).toBe(prevState); // Returns prev directly

      // Existing attempt with lower score (3) should be updated to 5
      const prevLowerState: QuizAttempts = {
        "quiz-1": { score: 3, maxScore: 10, passed: false },
      };
      const resultLowerState = updateFn(prevLowerState);
      expect(resultLowerState).toEqual({
        "quiz-1": { score: 5, maxScore: 10, passed: false },
      });
    });

    it("should append current lessonId to sideEffects completedIds list if missing from ref", async () => {
      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          ["lesson-completed"],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-not-completed", 10, 10, [1, 2]);
      });

      expect(handleQuizAttemptSideEffects).toHaveBeenCalledWith(
        mockSupabase,
        "user-123",
        "lesson-not-completed",
        10,
        10,
        true,
        ["lesson-completed", "lesson-not-completed"],
        mockShowToast
      );
    });

    it("should show toast error and skip side effects when Supabase insert fails", async () => {
      mockQuizAttemptsTable.insert.mockResolvedValueOnce({ error: new Error("DB Insert Error") });

      const { result } = renderHook(() =>
        useProgressMutations(
          mockUser,
          mockSupabase,
          mockShowToast,
          [],
          mockSetSupabaseCompletedLessonIds,
          mockSetSupabaseQuizAttempts,
          mockAppStateMarkLessonComplete,
          mockRecordQuizScore,
          "en"
        )
      );

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 10, 10, [1, 2]);
      });

      expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to save quiz result");
      expect(handleQuizAttemptSideEffects).not.toHaveBeenCalled();
    });
  });
});
