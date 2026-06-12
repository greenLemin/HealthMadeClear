import type { SupabaseClient } from "@supabase/supabase-js";

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
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {}
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
  attempts.push({ quizId, score, maxScore });
  setItem("quizAttempts", attempts);
}

export function clearGuestProgress() {
  const storage = getStorage();
  if (!storage) return;
  const keys = Object.keys(storage).filter((k) => k.startsWith(STORAGE_PREFIX));
  keys.forEach((k) => storage.removeItem(k));
}

export async function migrateGuestProgressToSupabase(supabase: SupabaseClient, userId: string) {
  const progress = getGuestProgress();

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
      console.error("Failed to migrate lesson progress:", lessonError);
    }
  }

  if (progress.quizAttempts.length > 0) {
    const quizRows = progress.quizAttempts.map((attempt) => ({
      user_id: userId,
      quiz_id: attempt.quizId,
      score: attempt.score,
      max_score: attempt.maxScore,
      passed: attempt.score >= attempt.maxScore * 0.7,
    }));

    const { error: quizError } = await supabase.from("quiz_attempts").insert(quizRows);

    if (quizError) {
      console.error("Failed to migrate quiz attempts:", quizError);
    }
  }

  clearGuestProgress();
}
