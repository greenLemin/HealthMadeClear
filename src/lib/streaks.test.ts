import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { updateStreak } from "./streaks";
import { createNotification } from "@/lib/notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/notifications", () => ({
  createNotification: vi.fn(),
}));

describe("updateStreak", () => {
  let mockSupabase: any;
  let mockFrom: any;
  let mockSelect: any;
  let mockEq: any;
  let mockSingle: any;
  let mockUpsert: any;
  let mockUpsertSelect: any;
  let mockUpsertSingle: any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSingle = vi.fn();
    mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    mockUpsertSingle = vi.fn();
    mockUpsertSelect = vi.fn().mockReturnValue({ single: mockUpsertSingle });
    mockUpsert = vi.fn().mockReturnValue({ select: mockUpsertSelect });

    // Ensure UPSERT handles when there is no chaining
    mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    });

    mockSupabase = {
      from: mockFrom,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create a new streak for a first-time user", async () => {
    vi.setSystemTime(new Date("2023-10-15T12:00:00Z"));

    mockSingle.mockResolvedValueOnce({ data: null, error: null });
    mockUpsertSingle.mockResolvedValueOnce({ data: {}, error: null });

    const result = await updateStreak(mockSupabase as unknown as SupabaseClient, "user1");

    expect(result).toEqual({ currentStreak: 1, longestStreak: 1, isNewDay: true });

    expect(mockFrom).toHaveBeenCalledWith("streaks");
    expect(mockSelect).toHaveBeenCalledWith("*");
    expect(mockEq).toHaveBeenCalledWith("user_id", "user1");

    expect(mockUpsert).toHaveBeenCalledWith({
      user_id: "user1",
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: "2023-10-15",
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it("should not increment streak if returning on the same day", async () => {
    vi.setSystemTime(new Date("2023-10-15T12:00:00Z"));

    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: "user1",
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: "2023-10-15",
      },
      error: null,
    });

    // For the second upsert which doesn't use .select().single()
    mockUpsert.mockResolvedValueOnce({ error: null });

    const result = await updateStreak(mockSupabase as unknown as SupabaseClient, "user1");

    expect(result).toEqual({ currentStreak: 5, longestStreak: 10, isNewDay: false });

    expect(mockUpsert).toHaveBeenCalledWith({
      user_id: "user1",
      current_streak: 5,
      longest_streak: 10,
      last_activity_date: "2023-10-15",
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it("should increment current streak and possibly longest streak if returning consecutive day", async () => {
    vi.setSystemTime(new Date("2023-10-16T12:00:00Z")); // Today

    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: "user1",
        current_streak: 5,
        longest_streak: 5,
        last_activity_date: "2023-10-15", // Yesterday
      },
      error: null,
    });

    mockUpsert.mockResolvedValueOnce({ error: null });

    const result = await updateStreak(mockSupabase as unknown as SupabaseClient, "user1");

    expect(result).toEqual({ currentStreak: 6, longestStreak: 6, isNewDay: true });

    expect(mockUpsert).toHaveBeenCalledWith({
      user_id: "user1",
      current_streak: 6,
      longest_streak: 6,
      last_activity_date: "2023-10-16",
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it("should reset streak to 1 if user missed a day", async () => {
    vi.setSystemTime(new Date("2023-10-18T12:00:00Z")); // Today

    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: "user1",
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: "2023-10-15", // Missed days
      },
      error: null,
    });

    mockUpsert.mockResolvedValueOnce({ error: null });

    const result = await updateStreak(mockSupabase as unknown as SupabaseClient, "user1");

    expect(result).toEqual({ currentStreak: 1, longestStreak: 10, isNewDay: true });

    expect(mockUpsert).toHaveBeenCalledWith({
      user_id: "user1",
      current_streak: 1,
      longest_streak: 10,
      last_activity_date: "2023-10-18",
    });

    expect(createNotification).not.toHaveBeenCalled();
  });

  it("should trigger notification on streak milestones (e.g. 3)", async () => {
    vi.setSystemTime(new Date("2023-10-16T12:00:00Z")); // Today

    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: "user1",
        current_streak: 2,
        longest_streak: 10,
        last_activity_date: "2023-10-15", // Yesterday
      },
      error: null,
    });

    mockUpsert.mockResolvedValueOnce({ error: null });

    const result = await updateStreak(mockSupabase as unknown as SupabaseClient, "user1");

    expect(result).toEqual({ currentStreak: 3, longestStreak: 10, isNewDay: true });

    expect(createNotification).toHaveBeenCalledWith(mockSupabase, "user1", {
      type: "streak",
      title: "3-Day Streak!",
      body: "You're on a 3-day learning streak. Keep it up!",
    });
  });

  it("should not trigger notification on streak milestones if returning on the same day", async () => {
    vi.setSystemTime(new Date("2023-10-15T12:00:00Z")); // Today

    // User already at milestone 3 today
    mockSingle.mockResolvedValueOnce({
      data: {
        user_id: "user1",
        current_streak: 3,
        longest_streak: 10,
        last_activity_date: "2023-10-15", // Same day
      },
      error: null,
    });

    mockUpsert.mockResolvedValueOnce({ error: null });

    const result = await updateStreak(mockSupabase as unknown as SupabaseClient, "user1");

    expect(result).toEqual({ currentStreak: 3, longestStreak: 10, isNewDay: false });

    expect(createNotification).not.toHaveBeenCalled();
  });
});
