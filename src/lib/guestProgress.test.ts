import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  clearGuestProgress,
  getGuestProgress,
  markLessonComplete,
  migrateGuestProgressToSupabase,
} from "./guestProgress";

describe("guestProgress", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and retrieves completed lessons", () => {
    markLessonComplete("lesson-1");
    expect(getGuestProgress().completedLessons).toEqual(["lesson-1"]);
  });

  it("returns fallback value when storage contains malformed JSON", () => {
    sessionStorage.setItem("hmc_guest_completedLessons", "{invalid-json]");
    expect(getGuestProgress().completedLessons).toEqual([]);
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

  it("clears progress after successful migration", async () => {
    markLessonComplete("lesson-1");

    const supabase = {
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({ error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
      })),
    };

    const result = await migrateGuestProgressToSupabase(supabase as never, "user-1");
    expect(result.ok).toBe(true);
    expect(getGuestProgress().completedLessons).toEqual([]);
  });

  it("clearGuestProgress removes all guest keys", () => {
    markLessonComplete("lesson-1");
    clearGuestProgress();
    expect(getGuestProgress().completedLessons).toEqual([]);
  });
});
