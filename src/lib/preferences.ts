import type { Locale } from "@/lib/i18n";

export type TextSize = "standard" | "large" | "largest";
export type ThemeMode = "light" | "dark";

export const PREFERENCE_COOKIES = {
  locale: "hmc-locale",
  theme: "hmc-theme",
  textSize: "hmc-text-size",
  simpleMode: "hmc-simple-mode",
} as const;

/**
 * Storage keys used across the application.
 * Every value MUST match `/^hmc[-_]/` so that `clearLocalHealthData()`
 * can safely identify and clean health/session storage while preserving preferences.
 */
export const STORAGE_KEYS = {
  locale: "hmc-locale",
  theme: "hmc-theme",
  textSize: "hmc-text-size",
  simpleMode: "hmc-simple-mode",
  completedLessons: "hmc-completed-lessons",
  recentLessons: "hmc-recent-lessons",
  startedPaths: "hmc-started-paths",
  quizScores: "hmc-quiz-scores",
  checklist: "hmc-checklist",
  visitPlanner: "hmc-visit-planner",
  visitPlannerV2: "hmc-visit-planner-v2",
} as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function setPreferenceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? ";Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax${secure}`;
}

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

export function readStoredLocale(): Locale {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.locale);
  if (fromCookie === "es") return "es";
  if (typeof window !== "undefined") {
    try {
      const fromStorage = window.localStorage.getItem(STORAGE_KEYS.locale);
      if (fromStorage === "es") return "es";
    } catch {
      return "en";
    }
  }
  return "en";
}

export function readStoredTheme(): ThemeMode {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.theme);
  if (fromCookie === "dark") return "dark";
  if (fromCookie === "light") return "light";
  if (typeof window !== "undefined") {
    try {
      const fromStorage = window.localStorage.getItem(STORAGE_KEYS.theme);
      if (fromStorage === "dark") return "dark";
      if (fromStorage === "light") return "light";
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    } catch {
      return "light";
    }
  }
  return "light";
}

export function readStoredTextSize(): TextSize {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.textSize);
  if (fromCookie === "large" || fromCookie === "largest") return fromCookie;
  if (typeof window !== "undefined") {
    try {
      const fromStorage = window.localStorage.getItem(STORAGE_KEYS.textSize);
      if (fromStorage === "large" || fromStorage === "largest") return fromStorage;
    } catch {
      return "standard";
    }
  }
  return "standard";
}

export function readStoredJson<T>(key: string, validate: (value: unknown) => T | null): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return validate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.warn("writeStoredJson failed:", e);
    }
  }
}

export function readStoredStringArray(key: string): string[] {
  const parsed = readStoredJson(key, (value) => (Array.isArray(value) ? value : null));
  if (!parsed) return [];
  return parsed.filter((item): item is string => typeof item === "string").slice(0, 200);
}

export function readStoredSimpleMode(): boolean {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.simpleMode);
  if (fromCookie === "true") return true;
  if (typeof window !== "undefined") {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.simpleMode) === "true";
    } catch {
      return false;
    }
  }
  return false;
}

export function applyDocumentPreferences(
  locale: Locale,
  theme: ThemeMode,
  textSize: TextSize,
  simpleMode: boolean
) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.textSize = textSize;
  document.documentElement.dataset.simpleMode = simpleMode ? "true" : "false";
  document.documentElement.classList.toggle("dark", theme === "dark");
}
