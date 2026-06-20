import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLocalizedAchievement, checkAndAwardAchievements, ACHIEVEMENTS } from "./achievements";
import { getMessages } from "./i18n";
import { createNotifications } from "./notifications";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("./i18n", () => ({
  getMessages: vi.fn(),
}));

vi.mock("./notifications", () => ({
  createNotifications: vi.fn(),
}));

describe("achievements", () => {
  describe("getLocalizedAchievement", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("returns merged achievement when localized data is present", () => {
      vi.mocked(getMessages).mockReturnValue({
        achievements: {
          items: {
            "first-lesson": {
              title: "Translated Title",
              description: "Translated Description",
            },
          },
        },
      } as any);

      const result = getLocalizedAchievement("first-lesson", "en");

      expect(result).toEqual({
        ...ACHIEVEMENTS["first-lesson"],
        title: "Translated Title",
        description: "Translated Description",
      });
    });

    it("falls back to base achievement when localized data is missing for the given id", () => {
      vi.mocked(getMessages).mockReturnValue({
        achievements: {
          items: {}, // Missing "first-lesson" intentionally
        },
      } as any);

      const result = getLocalizedAchievement("first-lesson", "es");

      expect(result).toEqual(ACHIEVEMENTS["first-lesson"]);
    });
  });

  describe("checkAndAwardAchievements", () => {
    let mockSupabase: any;
    let mockUpsert: any;
    let mockSelectChain: any;
    let mockEq: any;
    let mockSelect: any;
    let mockFrom: any;

    beforeEach(() => {
      vi.clearAllMocks();

      mockSelectChain = vi.fn().mockImplementation(() => {
        const lastUpsertCall = mockUpsert.mock.calls[mockUpsert.mock.calls.length - 1];
        const val = lastUpsertCall ? lastUpsertCall[0] : [];
        const achievements = Array.isArray(val) ? val : [val];
        return Promise.resolve({
          data: achievements.map((a: any) => ({ achievement_id: a.achievement_id })),
          error: null,
        });
      });

      mockUpsert = vi.fn().mockImplementation(() => {
        return {
          select: mockSelectChain,
        };
      });

      mockEq = vi.fn().mockResolvedValue({ data: [] });
      mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      mockFrom = vi.fn().mockReturnValue({
        select: mockSelect,
        upsert: mockUpsert,
      });

      mockSupabase = {
        from: mockFrom,
      };
    });

    it("awards first-lesson achievement when condition is met", async () => {
      const context = { totalLessonsCompleted: 1 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("first-lesson");
      expect(mockUpsert).toHaveBeenCalledWith(
        [
          {
            user_id: "user1",
            achievement_id: "first-lesson",
          },
        ],
        {
          onConflict: "user_id,achievement_id",
          ignoreDuplicates: true,
        }
      );
      expect(createNotifications).toHaveBeenCalled();
    });

    it("does not award first-lesson achievement when condition is not met", async () => {
      const context = { totalLessonsCompleted: 0 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).not.toContain("first-lesson");
      expect(mockUpsert).not.toHaveBeenCalled();
      expect(createNotifications).not.toHaveBeenCalled();
    });

    it("does not award achievement if already earned", async () => {
      mockEq.mockResolvedValue({
        data: [{ achievement_id: "first-lesson" }],
      });
      const context = { totalLessonsCompleted: 1 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).not.toContain("first-lesson");
      expect(mockUpsert).not.toHaveBeenCalled();
      expect(createNotifications).not.toHaveBeenCalled();
    });

    it("handles all available achievement checks correctly", async () => {
      const context = {
        totalLessonsCompleted: 15,
        quizPassed: true,
        quizScore: 100,
        quizMaxScore: 100,
        pathCompleted: true,
        currentStreak: 10,
        totalBeginnerLessonsCompleted: 5,
        totalBeginnerLessonsAvailable: 5,
        glossaryTermsLookedUp: 15,
      };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("first-lesson");
      expect(result).toContain("five-lessons");
      expect(result).toContain("ten-lessons");
      expect(result).toContain("first-quiz-pass");
      expect(result).toContain("perfect-quiz");
      expect(result).toContain("first-path-complete");
      expect(result).toContain("three-day-streak");
      expect(result).toContain("seven-day-streak");
      expect(result).toContain("all-beginner");
      expect(result).toContain("glossary-reader");

      expect(mockUpsert).toHaveBeenCalledTimes(1);
      expect(mockUpsert.mock.calls[0][0]).toHaveLength(10);
    });

    it("does not award notification if the achievement does not exist", async () => {
      // Test when DB fails to insert
      const context = { totalLessonsCompleted: 1 };

      mockSelectChain.mockResolvedValueOnce({ data: null, error: { message: "DB Error" } });

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).not.toContain("first-lesson");
      expect(createNotifications).not.toHaveBeenCalled();
    });

    it("does not call createNotification if achievement lookup returns null/undefined", async () => {
      const context = { totalLessonsCompleted: 1 };
      const originalFirstLesson = ACHIEVEMENTS["first-lesson"];

      // Temporarily delete achievement to test branch
      // We need to bypass TS here since it's an object property mutation for testing
      // The easiest way is to mock a completely missing achievement ID by passing custom context logic,
      // mutate ACHIEVEMENTS via any casting just for this test
      delete (ACHIEVEMENTS as any)["first-lesson"];

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("first-lesson"); // It gets pushed to newlyEarned
      expect(createNotifications).not.toHaveBeenCalled(); // But no notification is created

      // Restore
      (ACHIEVEMENTS as any)["first-lesson"] = originalFirstLesson;
    });

    it("handles case where existing data is null", async () => {
      mockEq.mockResolvedValue({
        data: null,
      });
      const context = { totalLessonsCompleted: 1 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("first-lesson");
      expect(mockUpsert).toHaveBeenCalled();
    });
  });
});
