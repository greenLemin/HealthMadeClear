import type { SupabaseClient } from "@supabase/supabase-js";
import { isQuizPassed, normalizeStoredScore } from "./quizScore";
import { QUIZ_ATTEMPTS_ON_CONFLICT } from "./supabase/schema";
import { logger } from "./logger";
import { STORAGE_KEYS } from "./preferences";

/** Prefix for all guest progress keys */
const STORAGE_PREFIX = "hmc_guest_";

// ─── Type guards ─────────────────────────────────────────────────────────────

function filterStringArray(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((item): item is string => typeof item === "string") : [];
}

function filterGuestQuizAttempts(x: unknown): GuestQuizAttempt[] {
  return Array.isArray(x) ? x.filter(isGuestQuizAttempt) : [];
}

export interface GuestQuizAttempt {
  quizId: string;
  score: number;
  maxScore: number;
  passed?: boolean;
  answers?: number[];
}

function isGuestQuizAttempt(x: unknown): x is GuestQuizAttempt {
  if (typeof x !== "object" || x === null) return false;
  const obj = x as Record<string, unknown>;
  return typeof obj.quizId === "string" && typeof obj.score === "number" && typeof obj.maxScore === "number";
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

/** Use localStorage for persistence across tab closes. */
function getStorage(): Storage | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage;
  } catch {
    return null;
  }
}

function getItem<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    logger.warn("Failed to read guest progress from storage:", e);
    return fallback;
  }
}

function setItem<T>(storage: Storage, key: string, value: T): void {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (e) {
    logger.warn("Failed to write guest progress to storage:", e);
  }
}

// ─── Key constants ────────────────────────────────────────────────────────────

const GUEST_LESSON_KEY = STORAGE_PREFIX + "completedLessons";
const GUEST_QUIZ_KEY = STORAGE_PREFIX + "quizAttempts";

// ─── Legacy session migration ────────────────────────────────────────────────

/**
 * One-time migration from sessionStorage to localStorage.
 * If local guest keys are empty, reads session equivalents, writes to local, then removes session keys.
 */
export function migrateLegacySessionGuest(): void {
  if (typeof localStorage === "undefined" || typeof sessionStorage === "undefined") return;
  try {
    // Only migrate if local is empty
    const hasLocal =
      localStorage.getItem(GUEST_LESSON_KEY) !== null || localStorage.getItem(GUEST_QUIZ_KEY) !== null;
    if (hasLocal) return;

    const rawLessons = sessionStorage.getItem(GUEST_LESSON_KEY);
    const rawQuizzes = sessionStorage.getItem(GUEST_QUIZ_KEY);

    if (rawLessons !== null) {
      try {
        const parsed: unknown = JSON.parse(rawLessons);
        const lessons = filterStringArray(parsed);
        if (lessons.length > 0) {
          localStorage.setItem(GUEST_LESSON_KEY, JSON.stringify(lessons));
        }
      } catch {
        // malformed — skip
      }
      sessionStorage.removeItem(GUEST_LESSON_KEY);
    }

    if (rawQuizzes !== null) {
      try {
        const parsed: unknown = JSON.parse(rawQuizzes);
        const quizzes = filterGuestQuizAttempts(parsed);
        if (quizzes.length > 0) {
          localStorage.setItem(GUEST_QUIZ_KEY, JSON.stringify(quizzes));
        }
      } catch {
        // malformed — skip
      }
      sessionStorage.removeItem(GUEST_QUIZ_KEY);
    }
  } catch (e) {
    logger.warn("Failed to migrate session guest progress:", e);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the union of guest lessons (from `hmc_guest_completedLessons` **and**
 * `STORAGE_KEYS.completedLessons`) plus all quiz attempts with a valid `quizId`.
 */
export function getGuestProgress(): {
  completedLessons: string[];
  quizAttempts: GuestQuizAttempt[];
} {
  const storage = getStorage();
  if (!storage) return { completedLessons: [], quizAttempts: [] };

  // Attempt one-time session → local migration on every read (idempotent after first run)
  migrateLegacySessionGuest();

  // Lessons: union of guest key and the UI STORAGE_KEYS.completedLessons
  const guestLessons = filterStringArray(getItem(storage, GUEST_LESSON_KEY, []));
  const uiLessons = filterStringArray(getItem(storage, STORAGE_KEYS.completedLessons, []));
  const lessonSet = new Set<string>([...guestLessons, ...uiLessons]);

  // Quizzes: keep valid quizId rows; skip bad entries in a mixed array
  const quizAttempts = filterGuestQuizAttempts(getItem(storage, GUEST_QUIZ_KEY, []));

  return { completedLessons: Array.from(lessonSet), quizAttempts };
}

export function markLessonComplete(lessonId: string): void {
  const storage = getStorage();
  if (!storage) return;
  const list = filterStringArray(getItem(storage, GUEST_LESSON_KEY, []));
  if (!list.includes(lessonId)) {
    list.push(lessonId);
    setItem(storage, GUEST_LESSON_KEY, list);
  }
  const uiList = filterStringArray(getItem(storage, STORAGE_KEYS.completedLessons, []));
  if (!uiList.includes(lessonId)) {
    uiList.push(lessonId);
    setItem(storage, STORAGE_KEYS.completedLessons, uiList);
  }
}

export function saveQuizAttempt(quizId: string, score: number, maxScore: number): void {
  const storage = getStorage();
  if (!storage) return;
  const attempts = filterGuestQuizAttempts(getItem(storage, GUEST_QUIZ_KEY, []));
  if (attempts.length >= 100) {
    attempts.splice(0, attempts.length - 99);
  }
  attempts.push({ quizId, score, maxScore });
  setItem(storage, GUEST_QUIZ_KEY, attempts);
}

/**
 * Clears only the guest-prefixed keys (`hmc_guest_*`).
 * Does NOT wipe preferences (locale, theme, etc.).
 */
export function clearGuestProgress(): void {
  const storage = getStorage();
  if (!storage) return;
  // Collect keys before iterating to avoid live-list mutation issues
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keys.push(k);
    }
  }
  keys.forEach((k) => storage.removeItem(k));
}

export type GuestMigrationResult = { ok: boolean; errors: string[] };

/**
 * Upserts all guest progress to Supabase.
 * Runs `normalizeStoredScore` on each quiz attempt (handles pre-P6 percent-in-score rows).
 * Does **not** clear guest keys — caller refetches, then `clearGuestProgress`.
 */
export async function migrateGuestProgressToSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<GuestMigrationResult> {
  const progress = getGuestProgress();
  const errors: string[] = [];

  if (progress.completedLessons.length > 0) {
    const lessonRows = progress.completedLessons.map((lessonId) => ({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    }));

    const { error: lessonError } = await supabase.from("lesson_progress").upsert(lessonRows, {
      onConflict: "user_id,lesson_id",
    });

    if (lessonError) {
      logger.error("Failed to migrate lesson progress:", lessonError);
      errors.push(lessonError.message);
    }
  }

  if (progress.quizAttempts.length > 0) {
    // Dedupe: keep best count score per quiz (after normalization)
    const bestByQuizId = new Map<string, GuestQuizAttempt>();
    for (const attempt of progress.quizAttempts) {
      // Normalize percent-in-score rows from pre-P6 clients
      const { score, maxScore } = normalizeStoredScore(attempt.score, attempt.maxScore);
      const normalized = { ...attempt, score, maxScore };
      const existing = bestByQuizId.get(attempt.quizId);
      if (!existing || score > existing.score) {
        bestByQuizId.set(attempt.quizId, normalized);
      }
    }

    const quizRows = Array.from(bestByQuizId.entries()).map(([quizId, { score, maxScore }]) => ({
      user_id: userId,
      quiz_id: quizId,
      score,
      max_score: maxScore,
      passed: isQuizPassed(score, maxScore),
    }));

    const { error: quizError } = await supabase.from("quiz_attempts").upsert(quizRows, {
      onConflict: QUIZ_ATTEMPTS_ON_CONFLICT,
    });

    if (quizError) {
      logger.error("Failed to migrate quiz attempts:", quizError);
      errors.push(quizError.message);
    }
  }

  return { ok: errors.length === 0, errors };
}
