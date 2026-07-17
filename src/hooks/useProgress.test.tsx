// @vitest-environment jsdom
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useProgress } from "./useProgress";
import { useAuth } from "@/hooks/useAuth";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { getGuestProgress, migrateGuestProgressToSupabase } from "@/lib/guestProgress";

vi.mock("@/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("@/components/AppProviders", () => ({ useAppState: vi.fn() }));
vi.mock("@/components/ui/ToastProvider", () => ({ useToast: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("next-intl", () => ({ useLocale: vi.fn(() => "en") }));
vi.mock("@/lib/guestProgress", () => ({
  getGuestProgress: vi.fn(() => ({ completedLessons: [], quizAttempts: [] })),
  markLessonComplete: vi.fn(),
  saveQuizAttempt: vi.fn(),
  migrateGuestProgressToSupabase: vi.fn(() => Promise.resolve({ ok: true })),
}));
vi.mock("@/lib/achievements", () => ({
  ACHIEVEMENTS: {},
  checkAndAwardAchievements: vi.fn(() => Promise.resolve([])),
}));
vi.mock("@/lib/streaks", () => ({ updateStreak: vi.fn(() => Promise.resolve({ currentStreak: 1 })) }));
vi.mock("@/lib/dashboard", () => ({ updateDailyLog: vi.fn(() => Promise.resolve()) }));
vi.mock("@/lib/notifications", () => ({ createNotification: vi.fn(() => Promise.resolve()) }));
vi.mock("@/lib/errorReporting", () => ({ reportClientError: vi.fn() }));
vi.mock("@/lib/paths/loadPaths", () => ({
  getAllLearningPaths: vi.fn(() => []),
}));

describe("useProgress hook", () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as any);
    vi.mocked(useAppState).mockReturnValue({
      completedLessons: new Set(),
      quizScores: [],
      markLessonComplete: vi.fn(),
      recordQuizScore: vi.fn(),
    } as any);
    vi.mocked(useToast).mockReturnValue({ showToast: vi.fn() } as any);

    // Mock Supabase client
    mockSupabase = {
      from: vi.fn((table) => {
        if (table === "lesson_progress") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            }),
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "quiz_attempts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [] }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      }),
    };
    vi.mocked(createClient).mockReturnValue(mockSupabase as any);
  });

  describe("Initialization & Unauthenticated State", () => {
    it("should initialize with empty state for unauthenticated user", () => {
      const { result } = renderHook(() => useProgress());
      expect(result.current.completedLessonIds).toEqual([]);
      expect(result.current.quizAttempts).toEqual({});
      expect(result.current.isLoading).toBe(false);
    });

    it("should return completed lesson IDs from AppState for unauthenticated user", () => {
      vi.mocked(useAppState).mockReturnValue({
        completedLessons: new Set(["lesson-1"]),
        quizScores: [{ lessonId: "lesson-1", score: 80, passed: true }],
        markLessonComplete: vi.fn(),
        recordQuizScore: vi.fn(),
      } as any);

      const { result } = renderHook(() => useProgress());

      expect(result.current.completedLessonIds).toEqual(["lesson-1"]);
      expect(result.current.quizAttempts).toEqual({
        "lesson-1": { score: 80, maxScore: 100, passed: true },
      });
      expect(result.current.isLessonComplete("lesson-1")).toBe(true);
      expect(result.current.isLessonComplete("lesson-2")).toBe(false);
    });
  });

  describe("Authenticated State & Fetching", () => {
    it("should fetch progress for authenticated user", async () => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: "user-123" }, loading: false } as any);

      mockSupabase.from = vi.fn((table) => {
        if (table === "lesson_progress") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [{ lesson_id: "lesson-auth-1" }] }),
              }),
            }),
            upsert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === "quiz_attempts") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ quiz_id: "quiz-auth-1", score: 90, max_score: 100, passed: true }],
              }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.completedLessonIds).toEqual(["lesson-auth-1"]);
      });
      expect(result.current.quizAttempts).toEqual({
        "quiz-auth-1": { score: 90, maxScore: 100, passed: true },
      });
    });
  });

  describe("Methods & Calculations", () => {
    it("should calculate learning path progress correctly", () => {
      vi.mocked(useAppState).mockReturnValue({
        completedLessons: new Set(["lesson-1", "lesson-2"]),
        quizScores: [],
        markLessonComplete: vi.fn(),
        recordQuizScore: vi.fn(),
      } as any);

      const { result } = renderHook(() => useProgress());

      const progress = result.current.getLearningPathProgress(["lesson-1", "lesson-2", "lesson-3"]);
      expect(progress).toEqual({
        completed: 2,
        total: 3,
        percentage: 67,
      });

      const emptyProgress = result.current.getLearningPathProgress([]);
      expect(emptyProgress).toEqual({
        completed: 0,
        total: 0,
        percentage: 0,
      });
    });

    it("should calculate best quiz score correctly", () => {
      vi.mocked(useAppState).mockReturnValue({
        completedLessons: new Set(),
        quizScores: [{ lessonId: "quiz-1", score: 80, passed: true }],
        markLessonComplete: vi.fn(),
        recordQuizScore: vi.fn(),
      } as any);

      const { result } = renderHook(() => useProgress());

      expect(result.current.getQuizBestScore("quiz-1")).toBe(80);
      expect(result.current.getQuizBestScore("non-existent")).toBeNull();
    });
  });

  describe("Guest Mutations", () => {
    it("should call guest markLessonComplete when unauthenticated", async () => {
      const mockGuestMarkLessonComplete = vi.fn();
      vi.mocked(useAppState).mockReturnValue({
        completedLessons: new Set(),
        quizScores: [],
        markLessonComplete: mockGuestMarkLessonComplete,
        recordQuizScore: vi.fn(),
      } as any);

      const { result } = renderHook(() => useProgress());

      await act(async () => {
        await result.current.markLessonComplete("lesson-1");
      });

      expect(mockGuestMarkLessonComplete).toHaveBeenCalledWith("lesson-1");
    });
  });

  describe("Guest Migration", () => {
    it("should migrate guest progress on initial auth load", async () => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: "user-123" }, loading: false } as any);
      vi.mocked(getGuestProgress).mockReturnValue({
        completedLessons: ["lesson-guest"],
        quizAttempts: [],
      });

      renderHook(() => useProgress());

      await waitFor(() => {
        expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
      });
    });

    it("should not migrate if no guest progress exists", async () => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: "user-123" }, loading: false } as any);
      vi.mocked(getGuestProgress).mockReturnValue({
        completedLessons: [],
        quizAttempts: [],
      });

      renderHook(() => useProgress());

      await waitFor(() => {
        expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
      });
    });
  });

  describe("Authenticated Mutations", () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: "user-123" }, loading: false } as any);

      mockSupabase = {
        from: vi.fn((table) => {
          if (table === "lesson_progress") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [] }),
                }),
              }),
              upsert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === "quiz_attempts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabase as any);
    });

    it("should handle successful markLessonComplete for authenticated user", async () => {
      const { result } = renderHook(() => useProgress());

      // Wait for initialization to finish and the initial completedLessonIds to be evaluated
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markLessonComplete("lesson-1");
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("lesson_progress");
      // Because we mock fetch to return empty, and `markLessonComplete` does an optimistic update:
      // setSupabaseCompletedLessonIds((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
      expect(result.current.completedLessonIds).toContain("lesson-1");
    });

    it("should handle successful saveQuizAttempt for authenticated user", async () => {
      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 80, 100, [1, 2]);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("quiz_attempts");
      expect(result.current.quizAttempts["quiz-1"]).toEqual({ score: 80, maxScore: 100, passed: true });
    });
  });

  describe("Error Handling", () => {
    it("should report client error when path loading fails during progress calculation", async () => {
      const { reportClientError } = await import("@/lib/errorReporting");
      const { getAllLearningPaths } = await import("@/lib/paths/loadPaths");

      vi.mocked(getAllLearningPaths).mockImplementationOnce(() => {
        throw new Error("Test path loading error");
      });

      // Override the mockSupabase for this test so upsert succeeds!
      const successSupabase = {
        from: vi.fn((table) => {
          if (table === "lesson_progress") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [] }),
                }),
              }),
              upsert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          if (table === "quiz_attempts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
            };
          }
          return {};
        }),
      };

      // I should just use the global import
      const { createClient } = await import("@/lib/supabase/client");
      vi.mocked(createClient).mockReturnValue(successSupabase as any);

      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markLessonComplete("lesson-1");
      });

      // markLessonComplete is async, wait for the error to be reported
      await waitFor(() => {
        expect(reportClientError).toHaveBeenCalledWith(expect.any(Error), {
          context: "Failed to load paths for progress calculation",
        });
      });
    });

    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({ user: { id: "user-123" }, loading: false } as any);

      mockSupabase = {
        from: vi.fn((table) => {
          if (table === "lesson_progress") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ data: [] }),
                }),
              }),
              upsert: vi.fn().mockResolvedValue({ error: new Error("Upsert failed") }),
            };
          }
          if (table === "quiz_attempts") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] }),
              }),
              insert: vi.fn().mockResolvedValue({ error: new Error("Insert failed") }),
            };
          }
          return {};
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabase as any);
    });

    it("should show error toast when markLessonComplete fails", async () => {
      const mockShowToast = vi.fn();
      vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast } as any);

      const { result } = renderHook(() => useProgress());

      await act(async () => {
        await result.current.markLessonComplete("lesson-1");
      });

      expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to save progress");
    });

    it("should show error toast when saveQuizAttempt fails", async () => {
      const mockShowToast = vi.fn();
      vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast } as any);

      const { result } = renderHook(() => useProgress());

      await act(async () => {
        await result.current.saveQuizAttempt("quiz-1", "lesson-1", 100, 100, [1, 2]);
      });

      expect(mockShowToast).toHaveBeenCalledWith("error", "Failed to save quiz result");
    });
  });
});
