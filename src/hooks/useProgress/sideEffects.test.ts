import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleLessonCompletionSideEffects,
  handleQuizAttemptSideEffects,
  type LocalizeAchievement,
  type ProgressCopy,
} from "./sideEffects";
import { updateDailyLog } from "@/lib/dashboard/dailyLog";
import { updateStreak } from "@/lib/streaks";
import { checkAndAwardAchievements } from "@/lib/achievements";
import { createNotifications } from "@/lib/notifications";
import { getGlossaryLookupCount } from "@/lib/glossaryLookups";
import { getPathsForLesson } from "./pathsCache";
import { BEGINNER_LESSON_IDS } from "@/data/lessonMeta";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

vi.mock("@/lib/dashboard/dailyLog", () => ({
  updateDailyLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/streaks", () => ({
  updateStreak: vi.fn().mockResolvedValue({
    currentStreak: 1,
    longestStreak: 1,
    isNewDay: true,
    milestoneReached: null,
  }),
}));

vi.mock("@/lib/achievements", () => ({
  ACHIEVEMENTS: {
    "first-lesson": {
      id: "first-lesson",
      title: "First Step",
      description: "Completed your first lesson",
      icon: "🌱",
    },
    "first-quiz-pass": {
      id: "first-quiz-pass",
      title: "Quiz Champion",
      description: "Passed your first quiz",
      icon: "✅",
    },
    "perfect-quiz": {
      id: "perfect-quiz",
      title: "Perfect Score",
      description: "Got 100% on a quiz",
      icon: "⭐",
    },
    "three-day-streak": {
      id: "three-day-streak",
      title: "On a Roll",
      description: "3-day learning streak",
      icon: "🔥",
    },
    "first-path-complete": {
      id: "first-path-complete",
      title: "Path Finder",
      description: "Completed your first learning path",
      icon: "🗺️",
    },
    "all-beginner": {
      id: "all-beginner",
      title: "Solid Foundation",
      description: "Completed all beginner lessons",
      icon: "🏗️",
    },
    "glossary-reader": {
      id: "glossary-reader",
      title: "Word Wizard",
      description: "Looked up 10 glossary terms",
      icon: "📖",
    },
  },
  checkAndAwardAchievements: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/lib/notifications", () => ({
  createNotifications: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/glossaryLookups", () => ({
  getGlossaryLookupCount: vi.fn().mockReturnValue(0),
}));

vi.mock("./pathsCache", () => ({
  loadPathsForLocale: vi.fn().mockResolvedValue([
    {
      id: "path-1",
      title: "Medication Basics",
      lessons: ["lesson-1", "lesson-2"],
    },
  ]),
  getPathsForLesson: vi.fn().mockReturnValue([
    {
      id: "path-1",
      title: "Medication Basics",
      lessons: ["lesson-1", "lesson-2"],
    },
  ]),
}));

function catalogLocalize(locale: "en" | "es"): LocalizeAchievement {
  const catalog = locale === "es" ? es : en;
  return (id: string) => {
    const items = catalog.achievements.items as Record<string, { title: string; description: string }>;
    const item = items[id] ?? { title: id, description: "" };
    return {
      title: item.title,
      description: item.description,
      unlocked: catalog.achievements.unlocked.replace("{title}", item.title),
    };
  };
}

function catalogProgressCopy(locale: "en" | "es"): ProgressCopy {
  const progress = (locale === "es" ? es : en).progress;
  return {
    pathAlmostThereTitle: progress.pathAlmostThereTitle,
    pathAlmostThereBody: (title: string) => progress.pathAlmostThere.replace("{title}", title),
    streakMilestoneTitle: (count: number) => progress.streakMilestoneTitle.replace("{count}", String(count)),
    streakMilestoneBody: (count: number) => progress.streakMilestoneBody.replace("{count}", String(count)),
  };
}

describe("sideEffects", () => {
  let mockSupabase: any;
  let mockShowToast: any;
  const executionOrder: string[] = [];
  const enLocalize = catalogLocalize("en");
  const esLocalize = catalogLocalize("es");
  const enProgressCopy = catalogProgressCopy("en");
  const esProgressCopy = catalogProgressCopy("es");

  beforeEach(() => {
    vi.clearAllMocks();
    executionOrder.length = 0;

    mockShowToast = vi.fn();
    mockSupabase = {} as any;

    vi.mocked(updateDailyLog).mockImplementation(async () => {
      executionOrder.push("updateDailyLog");
    });

    vi.mocked(updateStreak).mockImplementation(async () => {
      executionOrder.push("updateStreak");
      return { currentStreak: 3, longestStreak: 3, isNewDay: true, milestoneReached: null };
    });

    vi.mocked(checkAndAwardAchievements).mockImplementation(async () => {
      executionOrder.push("checkAndAwardAchievements");
      return [];
    });
  });

  it("does not hardcode Achievement unlocked in source", () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "sideEffects.ts"), "utf8");
    expect(src).not.toMatch(/Achievement unlocked:/);
    expect(src).not.toMatch(/loadLessons/);
    expect(src).not.toMatch(/@\/lib\/paths\/loadPaths/);
  });

  describe("handleLessonCompletionSideEffects", () => {
    it("executes in exact order: updateDailyLog -> updateStreak -> checkAndAwardAchievements", async () => {
      await handleLessonCompletionSideEffects(
        mockSupabase,
        "user-1",
        "lesson-1",
        ["lesson-1"],
        mockShowToast,
        "en",
        enLocalize,
        enProgressCopy
      );

      expect(executionOrder).toEqual(["updateDailyLog", "updateStreak", "checkAndAwardAchievements"]);
    });

    it("passes full context including streak, path completion, beginner count, and glossary lookups", async () => {
      vi.mocked(getGlossaryLookupCount).mockReturnValue(12);
      const beginnerId = BEGINNER_LESSON_IDS[0];
      if (!beginnerId) throw new Error("BEGINNER_LESSON_IDS is empty");

      await handleLessonCompletionSideEffects(
        mockSupabase,
        "user-1",
        "lesson-2",
        [beginnerId, "lesson-1", "lesson-2"],
        mockShowToast,
        "en",
        enLocalize,
        enProgressCopy
      );

      expect(checkAndAwardAchievements).toHaveBeenCalledWith(
        mockSupabase,
        "user-1",
        expect.objectContaining({
          totalLessonsCompleted: 3,
          currentStreak: 3,
          pathCompleted: true,
          totalBeginnerLessonsCompleted: 1,
          totalBeginnerLessonsAvailable: BEGINNER_LESSON_IDS.length,
          glossaryTermsLookedUp: 12,
        })
      );
    });

    it("toasts catalog unlocked string without injecting a mock unlocked value", async () => {
      vi.mocked(checkAndAwardAchievements).mockResolvedValueOnce(["three-day-streak"]);
      const expected = es.achievements.unlocked.replace(
        "{title}",
        es.achievements.items["three-day-streak"].title
      );

      await handleLessonCompletionSideEffects(
        mockSupabase,
        "user-1",
        "lesson-1",
        ["lesson-1"],
        mockShowToast,
        "es",
        esLocalize,
        esProgressCopy
      );

      expect(mockShowToast).toHaveBeenCalledWith("success", expected);
      expect(createNotifications).toHaveBeenCalledWith(
        mockSupabase,
        "user-1",
        expect.arrayContaining([
          expect.objectContaining({
            type: "achievement",
            title: expected,
            body: es.achievements.items["three-day-streak"].description,
          }),
        ])
      );
    });

    it("formats close-to-completion notification from progress copy", async () => {
      vi.mocked(getPathsForLesson).mockReturnValueOnce([
        {
          id: "path-1",
          title: "Conceptos Básicos de Medicamentos",
          lessons: ["lesson-1", "lesson-2"],
        } as any,
      ]);

      await handleLessonCompletionSideEffects(
        mockSupabase,
        "user-1",
        "lesson-1",
        ["lesson-1"],
        mockShowToast,
        "es",
        esLocalize,
        esProgressCopy
      );

      expect(createNotifications).toHaveBeenCalledWith(
        mockSupabase,
        "user-1",
        expect.arrayContaining([
          expect.objectContaining({
            type: "close-to-completion",
            title: es.progress.pathAlmostThereTitle,
            body: es.progress.pathAlmostThere.replace("{title}", "Conceptos Básicos de Medicamentos"),
          }),
        ])
      );
    });

    it("notifies streak milestones from progress copy after updateStreak returns a count", async () => {
      vi.mocked(updateStreak).mockResolvedValueOnce({
        currentStreak: 3,
        longestStreak: 3,
        isNewDay: true,
        milestoneReached: 3,
      });

      await handleLessonCompletionSideEffects(
        mockSupabase,
        "user-1",
        "lesson-1",
        ["lesson-1"],
        mockShowToast,
        "en",
        enLocalize,
        enProgressCopy
      );

      expect(createNotifications).toHaveBeenCalledWith(mockSupabase, "user-1", [
        {
          type: "streak",
          title: en.progress.streakMilestoneTitle.replace("{count}", "3"),
          body: en.progress.streakMilestoneBody.replace("{count}", "3"),
        },
      ]);
    });
  });

  describe("handleQuizAttemptSideEffects", () => {
    it("executes in exact order: updateDailyLog -> updateStreak -> checkAndAwardAchievements", async () => {
      await handleQuizAttemptSideEffects(
        mockSupabase,
        "user-1",
        "lesson-1",
        5,
        5,
        true,
        ["lesson-1"],
        mockShowToast,
        "en",
        enLocalize,
        enProgressCopy
      );

      expect(executionOrder).toEqual(["updateDailyLog", "updateStreak", "checkAndAwardAchievements"]);
    });

    it("passes quiz score context and awards quiz achievements from the catalog unlocked string", async () => {
      vi.mocked(checkAndAwardAchievements).mockResolvedValueOnce(["first-quiz-pass", "perfect-quiz"]);
      const firstQuiz = es.achievements.unlocked.replace(
        "{title}",
        es.achievements.items["first-quiz-pass"].title
      );
      const perfect = es.achievements.unlocked.replace(
        "{title}",
        es.achievements.items["perfect-quiz"].title
      );

      await handleQuizAttemptSideEffects(
        mockSupabase,
        "user-1",
        "lesson-1",
        5,
        5,
        true,
        ["lesson-1"],
        mockShowToast,
        "es",
        esLocalize,
        esProgressCopy
      );

      expect(checkAndAwardAchievements).toHaveBeenCalledWith(
        mockSupabase,
        "user-1",
        expect.objectContaining({
          totalLessonsCompleted: 1,
          quizPassed: true,
          quizScore: 5,
          quizMaxScore: 5,
          currentStreak: 3,
        })
      );

      expect(mockShowToast).toHaveBeenCalledWith("success", firstQuiz);
      expect(mockShowToast).toHaveBeenCalledWith("success", perfect);
      expect(createNotifications).toHaveBeenCalledWith(
        mockSupabase,
        "user-1",
        expect.arrayContaining([
          expect.objectContaining({
            type: "achievement",
            title: firstQuiz,
            body: es.achievements.items["first-quiz-pass"].description,
          }),
          expect.objectContaining({
            type: "achievement",
            title: perfect,
            body: es.achievements.items["perfect-quiz"].description,
          }),
        ])
      );
    });
  });
});
