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

  it("should return loading true and do nothing when authLoading is true", () => {
    vi.mocked(getGuestProgress).mockReturnValue({ completedLessons: ["l1"], quizAttempts: [] });
    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, true));

    expect(result.current.isMigrationLoading).toBe(true);
    expect(getGuestProgress).not.toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should set isMigrationLoading to false and not migrate when user is null", () => {
    const { result } = renderHook(() => useGuestMigration(null, mockSupabase, false));

    expect(result.current.isMigrationLoading).toBe(false);
    expect(getGuestProgress).not.toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should set isMigrationLoading to false and not call migrateGuestProgressToSupabase when guest has no progress", () => {
    vi.mocked(getGuestProgress).mockReturnValue({ completedLessons: [], quizAttempts: [] });
    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    expect(result.current.isMigrationLoading).toBe(false);
    expect(getGuestProgress).toHaveBeenCalled();
    expect(migrateGuestProgressToSupabase).not.toHaveBeenCalled();
  });

  it("should call migrateGuestProgressToSupabase and update loading status when guest has completed lessons", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({ completedLessons: ["lesson-1"], quizAttempts: [] });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({ ok: true } as any);

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should call migrateGuestProgressToSupabase when guest has quiz attempts", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [{ quizId: "q1" }] as any,
    });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({ ok: true } as any);

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should set isMigrationLoading to false when migrateGuestProgressToSupabase resolves with ok false", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({ completedLessons: ["lesson-1"], quizAttempts: [] });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({
      ok: false,
      error: new Error("Migration failed"),
    } as any);

    const { result } = renderHook(() => useGuestMigration(mockUser, mockSupabase, false));

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    expect(migrateGuestProgressToSupabase).toHaveBeenCalledWith(mockSupabase, "user-123");
  });

  it("should reset state if user logs out", async () => {
    vi.mocked(getGuestProgress).mockReturnValue({ completedLessons: ["lesson-1"], quizAttempts: [] });
    vi.mocked(migrateGuestProgressToSupabase).mockResolvedValue({ ok: true } as any);

    const { result, rerender } = renderHook(
      ({ user, authLoading }) => useGuestMigration(user, mockSupabase, authLoading),
      { initialProps: { user: mockUser as User | null, authLoading: false } }
    );

    await waitFor(() => {
      expect(result.current.isMigrationLoading).toBe(false);
    });

    rerender({ user: null, authLoading: false });

    expect(result.current.isMigrationLoading).toBe(false);
  });
});
