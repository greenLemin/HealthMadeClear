// @vitest-environment jsdom
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSupabaseProgress, useDerivedProgress } from "./supabaseProgress";
import type { User } from "@supabase/supabase-js";
import type { QuizScore } from "@/lib/progressExport";

describe("supabaseProgress hooks", () => {
  let mockSupabase: any;
  const mockUser = { id: "user-123" } as User;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "lesson_progress") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                  data: [{ lesson_id: "lesson-1" }, { lesson_id: "lesson-2" }],
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "quiz_attempts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [
                  { quiz_id: "quiz-1", score: 80, max_score: 100, passed: true },
                  { quiz_id: "quiz-1", score: 95, max_score: 100, passed: true },
                  { quiz_id: "quiz-2", score: 60, max_score: 100, passed: false },
                ],
                error: null,
              }),
            }),
          };
        }
        return {};
      }),
    };
  });

  describe("useSupabaseProgress", () => {
    it("should initialize with default empty values when user is null", () => {
      const { result } = renderHook(() => useSupabaseProgress(null, mockSupabase));

      expect(result.current.supabaseCompletedLessonIds).toEqual([]);
      expect(result.current.supabaseQuizAttempts).toEqual({});
      expect(result.current.isFetchLoading).toBe(false);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should fetch progress for authenticated user and pick highest score for quiz attempts", async () => {
      const { result } = renderHook(() => useSupabaseProgress(mockUser, mockSupabase));

      expect(result.current.isFetchLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      expect(result.current.supabaseCompletedLessonIds).toEqual(["lesson-1", "lesson-2"]);
      expect(result.current.supabaseQuizAttempts).toEqual({
        "quiz-1": { score: 95, maxScore: 100, passed: true },
        "quiz-2": { score: 60, maxScore: 100, passed: false },
      });
    });

    it("should not fetch progress if fetchWhen is false", () => {
      const { result } = renderHook(() =>
        useSupabaseProgress(mockUser, mockSupabase, { fetchWhen: false })
      );

      expect(result.current.isFetchLoading).toBe(false);
      expect(result.current.supabaseCompletedLessonIds).toEqual([]);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it("should reset state when user changes to null", async () => {
      const { result, rerender } = renderHook(
        ({ user }: { user: User | null }) => useSupabaseProgress(user, mockSupabase),
        { initialProps: { user: mockUser as User | null } }
      );

      await waitFor(() => {
        expect(result.current.supabaseCompletedLessonIds).toEqual(["lesson-1", "lesson-2"]);
      });

      rerender({ user: null });

      expect(result.current.supabaseCompletedLessonIds).toEqual([]);
      expect(result.current.supabaseQuizAttempts).toEqual({});
      expect(result.current.isFetchLoading).toBe(false);
    });

    it("should handle rejection/errors during fetchProgress gracefully and set isFetchLoading to false", async () => {
      const errorSupabase = {
        from: vi.fn().mockImplementation(() => {
          throw new Error("Network/Database failure");
        }),
      };

      const { result } = renderHook(() => useSupabaseProgress(mockUser, errorSupabase as any));

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      expect(result.current.supabaseCompletedLessonIds).toEqual([]);
      expect(result.current.supabaseQuizAttempts).toEqual({});
    });

    it("should handle null or error response objects from Supabase queries", async () => {
      const nullDataSupabase = {
        from: vi.fn((table: string) => {
          if (table === "lesson_progress") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: null, error: new Error("Failed") }),
                }),
              }),
            };
          }
          if (table === "quiz_attempts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: null, error: new Error("Failed") }),
              }),
            };
          }
          return {};
        }),
      };

      const { result } = renderHook(() => useSupabaseProgress(mockUser, nullDataSupabase as any));

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      expect(result.current.supabaseCompletedLessonIds).toEqual([]);
      expect(result.current.supabaseQuizAttempts).toEqual({});
    });

    it("should discard results if user switches mid-flight", async () => {
      let resolveLessonA!: (val: any) => void;
      const lessonPromiseA = new Promise((resolve) => {
        resolveLessonA = resolve;
      });

      let resolveLessonB!: (val: any) => void;
      const lessonPromiseB = new Promise((resolve) => {
        resolveLessonB = resolve;
      });

      const userA = { id: "user-A" } as User;
      const userB = { id: "user-B" } as User;

      const slowSupabase = {
        from: vi.fn((table: string) => {
          if (table === "lesson_progress") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn((_col: string, val: string) => ({
                  eq: vi.fn().mockReturnValue(val === "user-A" ? lessonPromiseA : lessonPromiseB),
                })),
              }),
            };
          }
          if (table === "quiz_attempts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            };
          }
          return {};
        }),
      };

      const { result, rerender } = renderHook(
        ({ user }: { user: User | null }) => useSupabaseProgress(user, slowSupabase as any),
        { initialProps: { user: userA as User | null } }
      );

      // Rerender with user B while user A fetch is pending
      rerender({ user: userB });

      // Resolve user A's promise with user A data
      resolveLessonA({ data: [{ lesson_id: "lesson-user-A" }], error: null });

      // State should not contain user A's lesson
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.supabaseCompletedLessonIds).toEqual([]);

      // Resolve user B's promise with user B data
      resolveLessonB({ data: [{ lesson_id: "lesson-user-B" }], error: null });

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      expect(result.current.supabaseCompletedLessonIds).toEqual(["lesson-user-B"]);
    });

    it("should support manual refetching and toggle isFetchLoading", async () => {
      const { result } = renderHook(() => useSupabaseProgress(mockUser, mockSupabase));

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      let refetchPromise: Promise<void>;
      act(() => {
        refetchPromise = result.current.refetch();
      });

      expect(result.current.isFetchLoading).toBe(true);

      await act(async () => {
        await refetchPromise;
      });

      expect(result.current.isFetchLoading).toBe(false);
      expect(result.current.supabaseCompletedLessonIds).toEqual(["lesson-1", "lesson-2"]);
    });

    it("should reset isFetchLoading on refetch rejection", async () => {
      const { result } = renderHook(() => useSupabaseProgress(mockUser, mockSupabase));

      await waitFor(() => {
        expect(result.current.isFetchLoading).toBe(false);
      });

      // Change mockSupabase to throw on refetch
      mockSupabase.from = vi.fn().mockImplementation(() => {
        throw new Error("Refetch error");
      });

      await act(async () => {
        await expect(result.current.refetch()).rejects.toThrow("Refetch error");
      });

      expect(result.current.isFetchLoading).toBe(false);
    });

    it("should support setter functions for state", () => {
      const { result } = renderHook(() => useSupabaseProgress(null, mockSupabase));

      act(() => {
        result.current.setSupabaseCompletedLessonIds(["custom-1"]);
        result.current.setSupabaseQuizAttempts({
          "quiz-custom": { score: 100, maxScore: 100, passed: true },
        });
      });

      expect(result.current.supabaseCompletedLessonIds).toEqual(["custom-1"]);
      expect(result.current.supabaseQuizAttempts).toEqual({
        "quiz-custom": { score: 100, maxScore: 100, passed: true },
      });
    });
  });

  describe("useDerivedProgress", () => {
    it("should return Supabase progress when user is authenticated", () => {
      const supabaseCompleted = ["sup-1", "sup-2"];
      const supabaseQuizzes = { "quiz-sup": { score: 90, maxScore: 100, passed: true } };
      const guestCompleted = new Set(["guest-1"]);
      const guestQuizzes: QuizScore[] = [{ lessonId: "quiz-guest", score: 50, passed: false, completedAt: "2026-01-01" }];

      const { result } = renderHook(() =>
        useDerivedProgress(
          mockUser,
          supabaseCompleted,
          supabaseQuizzes,
          guestCompleted,
          guestQuizzes
        )
      );

      expect(result.current.completedLessonIds).toEqual(["sup-1", "sup-2"]);
      expect(result.current.quizAttempts).toEqual(supabaseQuizzes);
      expect(Array.from(result.current.completedLessonIdsSet)).toEqual(["sup-1", "sup-2"]);
    });

    it("should return guest progress when user is unauthenticated", () => {
      const supabaseCompleted: string[] = [];
      const supabaseQuizzes = {};
      const guestCompleted = new Set(["guest-1", "guest-2"]);
      const guestQuizzes: QuizScore[] = [{ lessonId: "quiz-guest", score: 75, passed: true, completedAt: "2026-01-01" }];

      const { result } = renderHook(() =>
        useDerivedProgress(
          null,
          supabaseCompleted,
          supabaseQuizzes,
          guestCompleted,
          guestQuizzes
        )
      );

      expect(result.current.completedLessonIds).toEqual(["guest-1", "guest-2"]);
      expect(result.current.quizAttempts).toEqual({
        "quiz-guest": { score: 75, maxScore: 100, passed: true },
      });
      expect(Array.from(result.current.completedLessonIdsSet)).toEqual(["guest-1", "guest-2"]);
    });
  });
});
