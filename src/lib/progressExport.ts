import { STORAGE_KEYS } from "@/lib/preferences";

export type ExportedProgress = {
  version: 1;
  exportedAt: string;
  completedLessons: string[];
  recentLessons: string[];
  startedPaths: string[];
};

export function buildProgressExport(
  completedLessons: string[],
  recentLessons: string[],
  startedPaths: string[]
): ExportedProgress {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    completedLessons,
    recentLessons,
    startedPaths,
  };
}

export function downloadProgressExport(data: ExportedProgress) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `health-made-clear-progress-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseProgressImport(raw: string): ExportedProgress | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ExportedProgress>;
    if (parsed.version !== 1) return null;
    if (!Array.isArray(parsed.completedLessons) || !Array.isArray(parsed.recentLessons)) return null;
    if (!Array.isArray(parsed.startedPaths)) return null;
    return {
      version: 1,
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
      completedLessons: parsed.completedLessons.filter((id): id is string => typeof id === "string"),
      recentLessons: parsed.recentLessons.filter((id): id is string => typeof id === "string"),
      startedPaths: parsed.startedPaths.filter((id): id is string => typeof id === "string"),
    };
  } catch {
    return null;
  }
}

export function applyProgressImport(data: ExportedProgress) {
  window.localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(data.completedLessons));
  window.localStorage.setItem(STORAGE_KEYS.recentLessons, JSON.stringify(data.recentLessons));
  window.localStorage.setItem(STORAGE_KEYS.startedPaths, JSON.stringify(data.startedPaths));
}
