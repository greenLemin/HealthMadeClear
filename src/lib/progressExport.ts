import { STORAGE_KEYS } from "@/lib/preferences";
import { logger } from "@/lib/logger";

export type QuizScore = {
  lessonId: string;
  score: number;
  passed: boolean;
  completedAt: string;
};

export type ExportedProgress = {
  version: 2;
  exportedAt: string;
  completedLessons: string[];
  recentLessons: string[];
  startedPaths: string[];
  quizScores: QuizScore[];
};

export function buildProgressExport(
  completedLessons: string[],
  recentLessons: string[],
  startedPaths: string[],
  quizScores: QuizScore[] = []
): ExportedProgress {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    completedLessons,
    recentLessons,
    startedPaths,
    quizScores,
  };
}

export function downloadProgressExport(data: ExportedProgress) {
  if (typeof document === "undefined" || typeof URL === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  try {
    anchor.href = url;
    anchor.download = `health-made-clear-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    try {
      // Prefer parentNode (works even if body changed), fallback to body for
      // test mocks where parentNode is not wired up.
      if (anchor.parentNode) anchor.parentNode.removeChild(anchor);
      else document.body.removeChild(anchor);
    } catch {
      // Cleanup best-effort — a failed click must still revoke the object URL.
      try {
        document.body.removeChild(anchor);
      } catch {
        /* already removed */
      }
    }
    URL.revokeObjectURL(url);
  }
}

function isQuizScore(value: unknown): value is QuizScore {
  if (!value || typeof value !== "object") return false;
  const score = value as QuizScore & { maxScore?: unknown; max_score?: unknown };
  if (
    typeof score.lessonId !== "string" ||
    typeof score.score !== "number" ||
    !Number.isFinite(score.score) ||
    typeof score.passed !== "boolean" ||
    typeof score.completedAt !== "string"
  )
    return false;
  if (
    score.maxScore !== undefined &&
    (typeof score.maxScore !== "number" || !Number.isFinite(score.maxScore))
  )
    return false;
  if (
    score.max_score !== undefined &&
    (typeof score.max_score !== "number" || !Number.isFinite(score.max_score))
  )
    return false;
  return true;
}

export function parseProgressImport(raw: string): ExportedProgress | null {
  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      exportedAt?: string;
      completedLessons?: unknown;
      recentLessons?: unknown;
      startedPaths?: unknown;
      quizScores?: unknown;
    };
    if (parsed.version !== 1 && parsed.version !== 2) return null;
    if (!Array.isArray(parsed.completedLessons) || !Array.isArray(parsed.recentLessons)) return null;
    if (!Array.isArray(parsed.startedPaths)) return null;

    const quizScores = Array.isArray(parsed.quizScores) ? parsed.quizScores.filter(isQuizScore) : [];

    return {
      version: 2,
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
      completedLessons: parsed.completedLessons.filter((id): id is string => typeof id === "string"),
      recentLessons: parsed.recentLessons.filter((id): id is string => typeof id === "string"),
      startedPaths: parsed.startedPaths.filter((id): id is string => typeof id === "string"),
      quizScores,
    };
  } catch {
    return null;
  }
}

export function applyProgressImport(data: ExportedProgress) {
  const entries: Array<[string, unknown]> = [
    [STORAGE_KEYS.completedLessons, data.completedLessons],
    [STORAGE_KEYS.recentLessons, data.recentLessons],
    [STORAGE_KEYS.startedPaths, data.startedPaths],
    [STORAGE_KEYS.quizScores, data.quizScores],
  ];
  for (const [key, value] of entries) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      logger.warn(`applyProgressImport failed for ${key}:`, e);
    }
  }
}

export function readStoredQuizScores(): QuizScore[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.quizScores);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isQuizScore);
  } catch {
    return [];
  }
}
