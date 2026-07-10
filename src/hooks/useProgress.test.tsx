// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useProgress } from "@/hooks/useProgress";

const mocks = vi.hoisted(() => ({
  guestMarkLessonComplete: vi.fn(),
  saveQuizAttempt: vi.fn(),
  appStateMarkLessonComplete: vi.fn(),
  recordQuizScore: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({})),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false })),
}));

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/components/ui/ToastProvider", () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

vi.mock("@/lib/guestProgress", () => ({
  getGuestProgress: vi.fn(() => ({ completedLessons: [], quizAttempts: [] })),
  markLessonComplete: mocks.guestMarkLessonComplete,
  saveQuizAttempt: mocks.saveQuizAttempt,
  migrateGuestProgressToSupabase: vi.fn(),
}));

vi.mock("@/lib/achievements", () => ({
  ACHIEVEMENTS: {},
  checkAndAwardAchievements: vi.fn(),
}));

vi.mock("@/lib/streaks", () => ({
  updateStreak: vi.fn(),
}));

vi.mock("@/lib/dashboard", () => ({
  updateDailyLog: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(),
}));

vi.mock("@/lib/errorReporting", () => ({
  reportClientError: vi.fn(),
}));

vi.mock("@/components/AppProviders", () => ({
  useAppState: vi.fn(() => ({
    locale: "en",
    completedLessons: new Set(["lesson-a"]),
    quizScores: [
      { lessonId: "lesson-a", score: 80, passed: true },
      { lessonId: "lesson-b", score: 50, passed: false },
    ],
    markLessonComplete: mocks.appStateMarkLessonComplete,
    recordQuizScore: mocks.recordQuizScore,
  })),
}));

describe("useProgress (guest path)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes completed lessons from app state", () => {
    const { result } = renderHook(() => useProgress());

    expect(result.current.completedLessonIds).toEqual(["lesson-a"]);
    expect(result.current.isLessonComplete("lesson-a")).toBe(true);
    expect(result.current.isLessonComplete("lesson-b")).toBe(false);
  });

  it("reports best quiz score as percentage when maxScore assumed 100", () => {
    const { result } = renderHook(() => useProgress());

    expect(result.current.getQuizBestScore("lesson-a")).toBe(80);
    expect(result.current.getQuizBestScore("lesson-b")).toBe(50);
    expect(result.current.getQuizBestScore("never-attempted")).toBeNull();
  });

  it("computes learning path progress against completed set", () => {
    const { result } = renderHook(() => useProgress());

    const partial = result.current.getLearningPathProgress(["lesson-a", "lesson-b", "lesson-c"]);
    expect(partial).toEqual({ completed: 1, total: 3, percentage: 33 });

    const done = result.current.getLearningPathProgress(["lesson-a"]);
    expect(done).toEqual({ completed: 1, total: 1, percentage: 100 });

    const empty = result.current.getLearningPathProgress([]);
    expect(empty).toEqual({ completed: 0, total: 0, percentage: 0 });
  });

  it("markLessonComplete delegates to guest + app state when no user", async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.markLessonComplete("lesson-b");
    });

    expect(mocks.guestMarkLessonComplete).toHaveBeenCalledWith("lesson-b");
    expect(mocks.appStateMarkLessonComplete).toHaveBeenCalledWith("lesson-b");
  });

  it("saveQuizAttempt records guest score via app state when no user", async () => {
    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await result.current.saveQuizAttempt("quiz-b", "lesson-b", 70, 100, [0, 1, 2]);
    });

    expect(mocks.recordQuizScore).toHaveBeenCalledWith("lesson-b", 70, true);
  });
});
