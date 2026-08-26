// @vitest-environment jsdom
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useGuestMigration } from "./guestMigration";
import { getGuestProgress, migrateGuestProgressToSupabase } from "@/lib/guestProgress";
import type { User } from "@supabase/supabase-js";

vi.mock("@/lib/guestProgress", () => ({
  getGuestProgress: vi.fn(),
  migrateGuestProgressToSupabase: vi.fn(),
}));

describe("useGuestMigration hook", () => {
  const mockSupabase = {} as any;
  const mockUser = { id: "user-123" } as User;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do nothing and keep migration loading state when auth is loading", () => {
    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, true));

    expect(result.current.isMigrationLoading).toBe(true);
    expect(getGuestProgress).not.toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should mark migration complete without migrating when user is not logged in", async () => {
    const { result } = renderHook(() => useGuestMigration(null, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(getGuestProgress).not.toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should trigger migration when authenticated user has guest completed lessons", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({ ok: true, errors: [] });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(getGuestProgress).toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should trigger migration when authenticated user has guest quiz attempts", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [{ quizId: "quiz-1", score: 10, maxScore: 10 }],
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({ ok: true, errors: [] });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(getGuestProgress).toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should handle failed migration gracefully", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({ ok: false, errors: ["Failed to migrate"] });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should complete migration loading immediately if guest has no progress", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [],
    });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(getGuestProgress).toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should reset state when user logs out", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [],
    });

    const { result, rerender } = renderHook(
      ({ user, authLoading }) => useGuestMigration(user, mockSupabase, authLoading),
      {
        initialProps: { user: mockUser as User | null, authLoading: false },
      }
    );

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    // Log out user
    rerender({ user: null, authLoading: false });

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });
  });
});
