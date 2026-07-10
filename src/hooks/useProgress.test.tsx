// @vitest-environment jsdom
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useProgress } from "./useProgress";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "test-user-id" }, loading: false })),
}));

vi.mock("@/components/AppProviders", () => ({
  useAppState: vi.fn(() => ({
    completedLessons: new Set(),
    quizScores: [],
    markLessonComplete: vi.fn(),
    recordQuizScore: vi.fn(),
  })),
}));

vi.mock("@/components/ui/ToastProvider", () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

const mockSupabase = {
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
  }),
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } } }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  },
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => mockSupabase),
}));

vi.mock("@/lib/guestProgress", () => ({
  getGuestProgress: vi.fn().mockReturnValue({ completedLessons: [], quizAttempts: [] }),
  markLessonComplete: vi.fn(),
  saveQuizAttempt: vi.fn(),
  migrateGuestProgressToSupabase: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/lib/dashboard", () => ({
  updateDailyLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/achievements", () => ({
  ACHIEVEMENTS: {},
  checkAndAwardAchievements: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/streaks", () => ({
  updateStreak: vi.fn().mockResolvedValue({ currentStreak: 1 }),
}));

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(),
}));

vi.mock("@/lib/errorReporting", () => ({
  reportClientError: vi.fn(),
}));

vi.mock("@/lib/paths/loadPaths", () => ({
  getAllLearningPaths: vi.fn(),
}));

describe("useProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles promise rejection when loading paths or creating notification", async () => {
    const { reportClientError } = await import("@/lib/errorReporting");

    const mockError = new Error("Failed to load paths");
    const { getAllLearningPaths } = await import("@/lib/paths/loadPaths");
    vi.mocked(getAllLearningPaths).mockImplementationOnce(() => {
      throw mockError;
    });

    const originalPromiseAll = Promise.all;
    global.Promise.all = vi.fn().mockImplementation(async (promises) => {
      if (promises && promises.length === 2 && mockSupabase.from.mock.calls.length > 0) {
        return [{ data: [] }, { data: [] }];
      }
      return originalPromiseAll.call(Promise, promises);
    });

    const { useAuth } = await import("@/hooks/useAuth");
    vi.mocked(useAuth).mockReturnValue({ user: { id: "test-user-id" }, loading: false } as any);

    const { result } = renderHook(() => useProgress());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });

    const { updateStreak } = await import("@/lib/streaks");
    vi.mocked(updateStreak).mockResolvedValueOnce({ currentStreak: 1, longestStreak: 1, isNewDay: false });

    const mockSupabaseQuery = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockReturnValueOnce(mockSupabaseQuery as any);

    let p;
    act(() => {
      p = result.current.markLessonComplete("test-lesson-id");
    });

    try {
      await p;
    } catch (e) {}

    global.Promise.all = originalPromiseAll;

    expect(reportClientError).toHaveBeenCalledWith(mockError, {
      context: "Failed to load paths for progress calculation",
    });
  });
});
