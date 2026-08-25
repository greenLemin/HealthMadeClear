import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGuestMigration } from "./guestMigration";
import { getGuestProgress, migrateGuestProgressToSupabase } from "@/lib/guestProgress";
import type { User } from "@supabase/supabase-js";

vi.mock("@/lib/guestProgress", () => ({
  getGuestProgress: vi.fn(),
  migrateGuestProgressToSupabase: vi.fn(),
}));

describe("useGuestMigration", () => {
  const mockSupabase = {} as any;
  const mockUser = { id: "user-123" } as User;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should do nothing while auth is loading", () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, true));

    expect(result.current.isMigrationLoading).toBe(true);
    expect(getGuestProgress).not.toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should set isMigrationLoading to false when user is null (guest)", async () => {
    const { result } = renderHook(() => useGuestMigration(null, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });
    expect(getGuestProgress).not.toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should mark migration done and not call migrateGuestProgressToSupabase if guest has no progress", async () => {
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

  it("should trigger migration when authenticated user has completed lessons", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({
      ok: true,
      errors: [],
    });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });
    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should trigger migration when authenticated user has quiz attempts", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [{ quizId: "quiz-1", score: 80, maxScore: 100 }],
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({
      ok: true,
      errors: [],
    });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });
    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should handle migration failure and set isMigrationLoading to false without setting migrated to true", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({
      ok: false,
      errors: ["Database error"],
    });

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });
    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });
});
