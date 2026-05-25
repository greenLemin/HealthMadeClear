"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n";
import {
  STORAGE_KEYS,
  applyDocumentPreferences,
  readStoredLocale,
  readStoredSimpleMode,
  readStoredTextSize,
  readStoredTheme,
  setPreferenceCookie,
  type TextSize,
  type ThemeMode,
} from "@/lib/preferences";

export type { TextSize, ThemeMode };

type AppContextValue = {
  locale: Locale;
  theme: ThemeMode;
  textSize: TextSize;
  simpleMode: boolean;
  completedLessons: string[];
  recentLessons: string[];
  startedPaths: string[];
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setSimpleMode: (value: boolean) => void;
  toggleLessonComplete: (lessonId: string) => void;
  markLessonViewed: (lessonId: string) => void;
  markPathStarted: (pathId: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function readArray(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const value = window.localStorage.getItem(key);

  if (!value) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as string[];
  }
}

export default function AppProviders({
  children,
  locale: initialLocale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("standard");
  const [simpleMode, setSimpleModeState] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [recentLessons, setRecentLessons] = useState<string[]>([]);
  const [startedPaths, setStartedPaths] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(initialLocale);
    setThemeState(readStoredTheme());
    setTextSizeState(readStoredTextSize());
    setSimpleModeState(readStoredSimpleMode());
    setCompletedLessons(readArray(STORAGE_KEYS.completedLessons));
    setRecentLessons(readArray(STORAGE_KEYS.recentLessons));
    setStartedPaths(readArray(STORAGE_KEYS.startedPaths));
    setHydrated(true);
  }, [initialLocale]);

  useEffect(() => {
    if (!hydrated) return;
    setLocaleState(initialLocale);
  }, [hydrated, initialLocale]);

  useEffect(() => {
    if (!hydrated) return;
    applyDocumentPreferences(locale, theme, textSize, simpleMode);
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    window.localStorage.setItem(STORAGE_KEYS.textSize, textSize);
    window.localStorage.setItem(STORAGE_KEYS.simpleMode, String(simpleMode));
    setPreferenceCookie("hmc-locale", locale);
    setPreferenceCookie("hmc-theme", theme);
    setPreferenceCookie("hmc-text-size", textSize);
    setPreferenceCookie("hmc-simple-mode", String(simpleMode));
  }, [hydrated, locale, theme, textSize, simpleMode]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(completedLessons));
  }, [hydrated, completedLessons]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.recentLessons, JSON.stringify(recentLessons));
  }, [hydrated, recentLessons]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.startedPaths, JSON.stringify(startedPaths));
  }, [hydrated, startedPaths]);

  const setLocale = (value: Locale) => setLocaleState(value);
  const setTheme = (value: ThemeMode) => setThemeState(value);
  const setTextSize = (value: TextSize) => setTextSizeState(value);
  const setSimpleMode = (value: boolean) => setSimpleModeState(value);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      theme,
      textSize,
      simpleMode,
      completedLessons,
      recentLessons,
      startedPaths,
      setLocale,
      setTheme,
      setTextSize,
      setSimpleMode,
      toggleLessonComplete: (lessonId) => {
        setCompletedLessons((current) =>
          current.includes(lessonId)
            ? current.filter((id) => id !== lessonId)
            : [...current, lessonId]
        );
      },
      markLessonViewed: (lessonId) => {
        setRecentLessons((current) => [lessonId, ...current.filter((id) => id !== lessonId)].slice(0, 6));
      },
      markPathStarted: (pathId) => {
        setStartedPaths((current) => (current.includes(pathId) ? current : [...current, pathId]));
      },
    }),
    [locale, theme, textSize, simpleMode, completedLessons, recentLessons, startedPaths]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used within AppProviders");
  }

  return context;
}
