import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { updateDailyLog, getDailyLogForRange } from "../dailyLog";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logQueryError } from "../utils";

vi.mock("../utils", () => ({
  logQueryError: vi.fn(),
}));

describe("dailyLog", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("updateDailyLog", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should upsert today's activity for the user", async () => {
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });
      const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
      const mockSupabase = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      const userId = "test-user-id";
      await updateDailyLog(mockSupabase, userId);

      expect(mockFrom).toHaveBeenCalledWith("daily_log");
      expect(mockUpsert).toHaveBeenCalledWith(
        { user_id: userId, activity_date: "2024-05-10" },
        { onConflict: "user_id,activity_date" }
      );
      expect(logQueryError).toHaveBeenCalledWith("updateDailyLog", null);
    });

    it("should log error if upsert fails", async () => {
      const mockError = new Error("DB error");
      const mockUpsert = vi.fn().mockResolvedValue({ error: mockError });
      const mockFrom = vi.fn().mockReturnValue({ upsert: mockUpsert });
      const mockSupabase = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      await updateDailyLog(mockSupabase, "test-user");

      expect(logQueryError).toHaveBeenCalledWith("updateDailyLog", mockError);
    });
  });

  describe("getDailyLogForRange", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-05-10T12:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should fetch logs within range and return activity dates", async () => {
      const mockData = [{ activity_date: "2024-05-09" }, { activity_date: "2024-05-08" }];
      const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });
      const mockGte = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq = vi.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      const mockSupabase = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      const result = await getDailyLogForRange(mockSupabase, "test-user", 7);

      expect(mockFrom).toHaveBeenCalledWith("daily_log");
      expect(mockSelect).toHaveBeenCalledWith("activity_date");
      expect(mockEq).toHaveBeenCalledWith("user_id", "test-user");
      expect(mockGte).toHaveBeenCalledWith("activity_date", "2024-05-03"); // 7 days back from 2024-05-10
      expect(mockOrder).toHaveBeenCalledWith("activity_date", { ascending: false });

      expect(result).toEqual(["2024-05-09", "2024-05-08"]);
      expect(logQueryError).toHaveBeenCalledWith("getDailyLogForRange", null);
    });

    it("should return empty array and log error on failure", async () => {
      const mockError = new Error("DB error");
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockGte = vi.fn().mockReturnValue({ order: mockOrder });
      const mockEq = vi.fn().mockReturnValue({ gte: mockGte });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

      const mockSupabase = {
        from: mockFrom,
      } as unknown as SupabaseClient;

      const result = await getDailyLogForRange(mockSupabase, "test-user", 7);

      expect(result).toEqual([]);
      expect(logQueryError).toHaveBeenCalledWith("getDailyLogForRange", mockError);
    });
  });
});
