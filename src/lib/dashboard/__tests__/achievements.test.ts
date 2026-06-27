import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserAchievements } from "../achievements";
import { getLocalizedAchievement } from "@/lib/achievements";
import { logQueryError } from "../utils";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/achievements", () => ({
  ACHIEVEMENTS: {
    "first-lesson": {
      id: "first-lesson",
      icon: "🌱",
    },
    "first-quiz-pass": {
      id: "first-quiz-pass",
      icon: "✅",
    },
  },
  getLocalizedAchievement: vi.fn(),
}));

vi.mock("../utils", () => ({
  logQueryError: vi.fn(),
}));

describe("getUserAchievements", () => {
  let mockSupabase: any;
  let mockSelect: any;
  let mockEq: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEq = vi.fn().mockResolvedValue({
      data: [{ achievement_id: "first-lesson", earned_at: "2023-01-01T00:00:00Z" }],
      error: null,
    });
    mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase = {
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    };

    vi.mocked(getLocalizedAchievement).mockImplementation((id, locale) => {
      if (id === "first-lesson") {
        return {
          id: "first-lesson",
          icon: "🌱",
          title: "First Step",
          description: "Completed your first lesson",
        } as any;
      }
      return {
        id: "first-quiz-pass",
        icon: "✅",
        title: "Quiz Champion",
        description: "Passed your first quiz",
      } as any;
    });
  });

  it("successfully fetches and maps achievements", async () => {
    const achievements = await getUserAchievements(mockSupabase as unknown as SupabaseClient, "user1");

    expect(mockSupabase.from).toHaveBeenCalledWith("achievements");
    expect(mockSelect).toHaveBeenCalledWith("achievement_id, earned_at");
    expect(mockEq).toHaveBeenCalledWith("user_id", "user1");

    expect(achievements).toHaveLength(2);

    const firstLesson = achievements.find((a) => a.id === "first-lesson");
    expect(firstLesson).toEqual({
      id: "first-lesson",
      title: "First Step",
      description: "Completed your first lesson",
      icon: "🌱",
      earned: true,
      earnedAt: "2023-01-01T00:00:00Z",
    });

    const firstQuiz = achievements.find((a) => a.id === "first-quiz-pass");
    expect(firstQuiz).toEqual({
      id: "first-quiz-pass",
      title: "Quiz Champion",
      description: "Passed your first quiz",
      icon: "✅",
      earned: false,
      earnedAt: null,
    });

    expect(logQueryError).toHaveBeenCalledWith("getUserAchievements", null);
  });

  it("handles null data and logs errors", async () => {
    const errorObj = new Error("DB Error");
    mockEq.mockResolvedValueOnce({
      data: null,
      error: errorObj,
    });

    const achievements = await getUserAchievements(mockSupabase as unknown as SupabaseClient, "user1");

    expect(logQueryError).toHaveBeenCalledWith("getUserAchievements", errorObj);

    expect(achievements).toHaveLength(2);
    expect(achievements[0].earned).toBe(false);
    expect(achievements[1].earned).toBe(false);
  });

  it("uses the provided locale", async () => {
    await getUserAchievements(mockSupabase as unknown as SupabaseClient, "user1", "es");

    expect(getLocalizedAchievement).toHaveBeenCalledWith("first-lesson", "es");
    expect(getLocalizedAchievement).toHaveBeenCalledWith("first-quiz-pass", "es");
  });
});
