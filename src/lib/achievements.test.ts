import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  createNotification: vi.fn(),
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

    it("awards first-lesson achievement when condition is met and returns IDs only", async () => {
      const context = { totalLessonsCompleted: 1 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toEqual(["first-lesson"]);
      expect(createNotifications).not.toHaveBeenCalled();
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
    });

    it("awards three-day-streak when currentStreak is 3 and not previously earned", async () => {
      const context = { totalLessonsCompleted: 3, currentStreak: 3 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("three-day-streak");
    });

    it("does not award three-day-streak when currentStreak is 2", async () => {
      const context = { totalLessonsCompleted: 2, currentStreak: 2 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).not.toContain("three-day-streak");
    });

    it("awards first-path-complete when pathCompleted is true", async () => {
      const context = { totalLessonsCompleted: 5, pathCompleted: true };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("first-path-complete");
    });

    it("awards all-beginner when all beginner lessons are completed", async () => {
      const context = {
        totalLessonsCompleted: 34,
        totalBeginnerLessonsCompleted: 34,
        totalBeginnerLessonsAvailable: 34,
      };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("all-beginner");
    });

    it("awards glossary-reader when glossaryTermsLookedUp >= 10", async () => {
      const context = { totalLessonsCompleted: 1, glossaryTermsLookedUp: 10 };

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toContain("glossary-reader");
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

    it("returns empty array when DB upsert fails", async () => {
      const context = { totalLessonsCompleted: 1 };

      mockSelectChain.mockResolvedValueOnce({ data: null, error: { message: "DB Error" } });

      const result = await checkAndAwardAchievements(
        mockSupabase as unknown as SupabaseClient,
        "user1",
        context
      );

      expect(result).toEqual([]);
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

  it("award helper source does not insert Achievement Unlocked notifications", () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "achievements.ts"), "utf8");
    expect(src).not.toMatch(/Achievement Unlocked:/);
  });
});
