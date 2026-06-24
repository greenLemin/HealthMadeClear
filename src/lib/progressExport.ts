import { STORAGE_KEYS } from "@/lib/preferences";

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
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `health-made-clear-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function isQuizScore(value: unknown): value is QuizScore {
  if (!value || typeof value !== "object") return false;
  const score = value as QuizScore;
  return (
    typeof score.lessonId === "string" &&
    typeof score.score === "number" &&
    typeof score.passed === "boolean" &&
    typeof score.completedAt === "string"
  );
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
  window.localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(data.completedLessons));
  window.localStorage.setItem(STORAGE_KEYS.recentLessons, JSON.stringify(data.recentLessons));
  window.localStorage.setItem(STORAGE_KEYS.startedPaths, JSON.stringify(data.startedPaths));
  window.localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(data.quizScores));
}

export function readStoredQuizScores(): QuizScore[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEYS.quizScores);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isQuizScore);
  } catch {
    return [];
  }
}
