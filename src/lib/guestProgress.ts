import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";

const STORAGE_PREFIX = "hmc_guest_";

function getStorage(): Storage | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage;
}

function getItem<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    logger.warn("Failed to read guest progress from storage:", e);
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    logger.warn("Failed to write guest progress to storage:", e);
  }
}

export function getGuestProgress() {
  return {
    completedLessons: getItem<string[]>("completedLessons", []),
    quizAttempts: getItem<{ quizId: string; score: number; maxScore: number }[]>("quizAttempts", []),
  };
}

export function markLessonComplete(lessonId: string) {
  const completed = getItem<string[]>("completedLessons", []);
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    setItem("completedLessons", completed);
  }
}

export function saveQuizAttempt(quizId: string, score: number, maxScore: number) {
  const attempts = getItem<{ quizId: string; score: number; maxScore: number }[]>("quizAttempts", []);
  if (attempts.length >= 100) {
    attempts.splice(0, attempts.length - 99);
  }
  attempts.push({ quizId, score, maxScore });
  setItem("quizAttempts", attempts);
}

export function clearGuestProgress() {
  const storage = getStorage();
  if (!storage) return;
  const keys = Object.keys(storage).filter((k) => k.startsWith(STORAGE_PREFIX));
  keys.forEach((k) => storage.removeItem(k));
}

export type GuestMigrationResult = { ok: boolean; errors: string[] };

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
    const bestByQuizId = new Map<string, { score: number; maxScore: number }>();
    for (const attempt of progress.quizAttempts) {
      const existing = bestByQuizId.get(attempt.quizId);
      if (!existing || attempt.score > existing.score) {
        bestByQuizId.set(attempt.quizId, { score: attempt.score, maxScore: attempt.maxScore });
      }
    }
    const quizRows = Array.from(bestByQuizId.entries()).map(([quizId, { score, maxScore }]) => ({
      user_id: userId,
      quiz_id: quizId,
      score,
      max_score: maxScore,
      passed: score >= maxScore * 0.7,
    }));

    const { error: quizError } = await supabase.from("quiz_attempts").upsert(quizRows, {
      onConflict: "user_id,quiz_id",
    });

    if (quizError) {
      logger.error("Failed to migrate quiz attempts:", quizError);
      errors.push(quizError.message);
    }
  }

  if (errors.length === 0) {
    clearGuestProgress();
  }

  return { ok: errors.length === 0, errors };
}
