// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  clearGuestProgress,
  getGuestProgress,
  markLessonComplete,
  saveQuizAttempt,
  migrateLegacySessionGuest,
  migrateGuestProgressToSupabase,
} from "./guestProgress";
import { logger } from "./logger";
import { STORAGE_KEYS } from "./preferences";

describe("guestProgress", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores and retrieves completed lessons", () => {
    markLessonComplete("lesson-1");
    expect(getGuestProgress().completedLessons).toEqual(["lesson-1"]);
  });

  it("stores and retrieves quiz attempts", () => {
    saveQuizAttempt("quiz-1", 8, 10);
    expect(getGuestProgress().quizAttempts).toEqual([{ quizId: "quiz-1", score: 8, maxScore: 10 }]);
  });

  it("returns fallback value when storage contains malformed JSON", () => {
    localStorage.setItem("hmc_guest_completedLessons", "{invalid-json]");
    expect(getGuestProgress().completedLessons).toEqual([]);
  });

  it("returns fallback value when storage throws an error on read", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    expect(getGuestProgress().completedLessons).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith("Failed to read guest progress from storage:", expect.any(Error));
  });

  it("logs warning and catches error when storage.setItem throws on markLessonComplete", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    expect(() => markLessonComplete("lesson-error")).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith("Failed to write guest progress to storage:", expect.any(Error));
  });

  it("logs warning and catches error when storage.setItem throws on saveQuizAttempt", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    expect(() => saveQuizAttempt("quiz-1", 10, 10)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith("Failed to write guest progress to storage:", expect.any(Error));
  });

  it("clears progress only after successful migration", async () => {
    markLessonComplete("lesson-1");

    const supabase = {
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    const result = await migrateGuestProgressToSupabase(supabase as never, "user-1");
    expect(result.ok).toBe(false);
    expect(getGuestProgress().completedLessons).toEqual(["lesson-1"]);
  });

  it("does not clear guest keys after successful migration — caller refetches then clears", async () => {
    markLessonComplete("lesson-1");

    const supabase = {
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    const result = await migrateGuestProgressToSupabase(supabase as never, "user-1");
    expect(result.ok).toBe(true);
    expect(getGuestProgress().completedLessons).toContain("lesson-1");
    expect(localStorage.getItem("hmc_guest_completedLessons")).not.toBeNull();
  });

  it("clearGuestProgress removes guest-prefixed keys only", () => {
    localStorage.setItem("hmc_guest_completedLessons", JSON.stringify(["lesson-1"]));
    localStorage.setItem("hmc_guest_quizAttempts", JSON.stringify([{ quizId: "q", score: 1, maxScore: 1 }]));
    clearGuestProgress();
    expect(localStorage.getItem("hmc_guest_completedLessons")).toBeNull();
    expect(localStorage.getItem("hmc_guest_quizAttempts")).toBeNull();
  });

  it("markLessonComplete writes both guest and UI completed-lesson keys", () => {
    markLessonComplete("lesson-1");
    expect(JSON.parse(localStorage.getItem("hmc_guest_completedLessons") ?? "[]")).toContain("lesson-1");
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.completedLessons) ?? "[]")).toContain("lesson-1");
  });

  it("early-exits without making Supabase calls if there is no guest progress", async () => {
    // sessionStorage is empty, getGuestProgress returns empty arrays
    const supabase = {
      from: vi.fn(),
    };

    const result = await migrateGuestProgressToSupabase(supabase as never, "user-1");

    expect(result.ok).toBe(true);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("normalizes percent-in-score guest attempts on migrate upsert", async () => {
    saveQuizAttempt("quiz-1", 80, 5);

    const upsert = vi.fn().mockResolvedValue({ error: null });
    const supabase = {
      from: vi.fn(() => ({ upsert })),
    };

    const result = await migrateGuestProgressToSupabase(supabase as never, "user-1");
    expect(result.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          quiz_id: "quiz-1",
          score: 4,
          max_score: 5,
          passed: true,
        }),
      ],
      { onConflict: "user_id,quiz_id" }
    );
  });

  // ── Schema guards ──────────────────────────────────────────────────────────

  it("schema guard rejects malformed quiz attempt {foo:1}", () => {
    localStorage.setItem("hmc_guest_quizAttempts", JSON.stringify([{ foo: 1 }]));
    expect(getGuestProgress().quizAttempts).toEqual([]);
  });

  it("schema guard rejects attempt with lessonId only (no quizId)", () => {
    localStorage.setItem(
      "hmc_guest_quizAttempts",
      JSON.stringify([{ lessonId: "x", score: 4, maxScore: 5 }])
    );
    expect(getGuestProgress().quizAttempts).toEqual([]);
  });

  it("valid attempt with quizId passes schema guard", () => {
    localStorage.setItem(
      "hmc_guest_quizAttempts",
      JSON.stringify([{ quizId: "quiz-1", score: 4, maxScore: 5 }])
    );
    expect(getGuestProgress().quizAttempts).toEqual([{ quizId: "quiz-1", score: 4, maxScore: 5 }]);
  });

  it("mixed quiz array keeps valid rows and skips bad entries", () => {
    localStorage.setItem(
      "hmc_guest_quizAttempts",
      JSON.stringify([
        { quizId: "quiz-keep", score: 4, maxScore: 5 },
        { foo: 1 },
        { lessonId: "x", score: 4, maxScore: 5 },
      ])
    );
    expect(getGuestProgress().quizAttempts).toEqual([{ quizId: "quiz-keep", score: 4, maxScore: 5 }]);
  });

  it("mixed lesson array keeps valid strings", () => {
    localStorage.setItem(
      "hmc_guest_completedLessons",
      JSON.stringify(["keep-me", 12, { id: "x" }, "also-keep"])
    );
    expect(getGuestProgress().completedLessons).toEqual(expect.arrayContaining(["keep-me", "also-keep"]));
    expect(getGuestProgress().completedLessons).toHaveLength(2);
  });

  // ── Session → localStorage migration ──────────────────────────────────────

  it("sessionStorage-only legacy data migrates once to localStorage", () => {
    sessionStorage.setItem("hmc_guest_completedLessons", JSON.stringify(["legacy-lesson"]));
    const progress = getGuestProgress();
    expect(progress.completedLessons).toContain("legacy-lesson");
    // Session key removed
    expect(sessionStorage.getItem("hmc_guest_completedLessons")).toBeNull();
    // Local key now populated
    expect(localStorage.getItem("hmc_guest_completedLessons")).not.toBeNull();
  });

  it("migrateLegacySessionGuest does not overwrite existing localStorage", () => {
    localStorage.setItem("hmc_guest_completedLessons", JSON.stringify(["local-lesson"]));
    sessionStorage.setItem("hmc_guest_completedLessons", JSON.stringify(["session-lesson"]));
    migrateLegacySessionGuest();
    const local = JSON.parse(localStorage.getItem("hmc_guest_completedLessons") ?? "[]");
    expect(local).toContain("local-lesson");
    expect(local).not.toContain("session-lesson");
  });

  // ── Union with STORAGE_KEYS.completedLessons ───────────────────────────────

  it("unions guest key lessons with STORAGE_KEYS.completedLessons", () => {
    localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(["lesson-from-ui"]));
    markLessonComplete("lesson-from-guest");
    const { completedLessons } = getGuestProgress();
    expect(completedLessons).toContain("lesson-from-ui");
    expect(completedLessons).toContain("lesson-from-guest");
  });

  // ── clearGuestProgress preserves prefs ────────────────────────────────────

  it("clearGuestProgress does NOT wipe preference keys", () => {
    localStorage.setItem(STORAGE_KEYS.theme, "dark");
    markLessonComplete("lesson-1");
    clearGuestProgress();
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");
  });
});
