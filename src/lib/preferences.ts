import type { Locale } from "@/lib/i18n";

export type TextSize = "standard" | "large" | "largest";
export type ThemeMode = "light" | "dark";

export const PREFERENCE_COOKIES = {
  locale: "hmc-locale",
  theme: "hmc-theme",
  textSize: "hmc-text-size",
  simpleMode: "hmc-simple-mode",
} as const;

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
} as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function setPreferenceCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const secure = process.env.NODE_ENV === "production" ? ";Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax${secure}`;
}

export function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function readStoredLocale(): Locale {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.locale);
  if (fromCookie === "es") return "es";
  if (typeof window !== "undefined") {
    const fromStorage = window.localStorage.getItem(STORAGE_KEYS.locale);
    if (fromStorage === "es") return "es";
  }
  return "en";
}

export function readStoredTheme(): ThemeMode {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.theme);
  if (fromCookie === "dark") return "dark";
  if (fromCookie === "light") return "light";
  if (typeof window !== "undefined") {
    const fromStorage = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (fromStorage === "dark") return "dark";
    if (fromStorage === "light") return "light";
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return "light";
}

export function readStoredTextSize(): TextSize {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.textSize);
  if (fromCookie === "large" || fromCookie === "largest") return fromCookie;
  if (typeof window !== "undefined") {
    const fromStorage = window.localStorage.getItem(STORAGE_KEYS.textSize);
    if (fromStorage === "large" || fromStorage === "largest") return fromStorage;
  }
  return "standard";
}

export function readStoredJson<T>(key: string, validate: (value: unknown) => T | null): T | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    return validate(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readStoredStringArray(key: string): string[] {
  const parsed = readStoredJson(key, (value) => (Array.isArray(value) ? value : null));
  if (!parsed) return [];
  return parsed.filter((item): item is string => typeof item === "string");
}

export function readStoredSimpleMode(): boolean {
  const fromCookie = getCookieValue(PREFERENCE_COOKIES.simpleMode);
  if (fromCookie === "true") return true;
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(STORAGE_KEYS.simpleMode) === "true";
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

export const PREFERENCE_BOOTSTRAP_SCRIPT = `
(function(){
  var c=document.cookie.split(';').reduce(function(a,s){var p=s.trim().split('=');if(p[0])a[p[0]]=decodeURIComponent(p[1]||'');return a},{});
  var locale=c['hmc-locale']==='es'?'es':'en';
  var theme=c['hmc-theme'];
  if(!theme)theme=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  if(theme!=='dark')theme='light';
  var textSize=c['hmc-text-size']||'standard';
  if(textSize!=='large'&&textSize!=='largest')textSize='standard';
  var simpleMode=c['hmc-simple-mode']==='true';
  var el=document.documentElement;
  el.lang=locale;
  el.dataset.locale=locale;
  el.dataset.theme=theme;
  el.dataset.textSize=textSize;
  el.dataset.simpleMode=simpleMode?'true':'false';
  if(theme==='dark')el.classList.add('dark');
})();
`.trim();
