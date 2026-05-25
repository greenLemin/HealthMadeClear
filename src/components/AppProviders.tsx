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

export type TextSize = "standard" | "large" | "largest";
export type ThemeMode = "light" | "dark";

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

const STORAGE_KEYS = {
  locale: "hmc-locale",
  theme: "hmc-theme",
  textSize: "hmc-text-size",
  simpleMode: "hmc-simple-mode",
  completedLessons: "hmc-completed-lessons",
  recentLessons: "hmc-recent-lessons",
  startedPaths: "hmc-started-paths",
} as const;

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

export default function AppProviders({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [textSize, setTextSize] = useState<TextSize>("standard");
  const [simpleMode, setSimpleMode] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [recentLessons, setRecentLessons] = useState<string[]>([]);
  const [startedPaths, setStartedPaths] = useState<string[]>([]);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(STORAGE_KEYS.locale) as Locale | null;
    const savedTheme = window.localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    const savedTextSize = window.localStorage.getItem(STORAGE_KEYS.textSize) as TextSize | null;
    const savedSimpleMode = window.localStorage.getItem(STORAGE_KEYS.simpleMode);

    setLocale(savedLocale === "es" ? "es" : "en");
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setTextSize(savedTextSize === "large" || savedTextSize === "largest" ? savedTextSize : "standard");
    setSimpleMode(savedSimpleMode === "true");
    setCompletedLessons(readArray(STORAGE_KEYS.completedLessons));
    setRecentLessons(readArray(STORAGE_KEYS.recentLessons));
    setStartedPaths(readArray(STORAGE_KEYS.startedPaths));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textSize = textSize;
    document.documentElement.dataset.simpleMode = simpleMode ? "true" : "false";
    window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    window.localStorage.setItem(STORAGE_KEYS.textSize, textSize);
    window.localStorage.setItem(STORAGE_KEYS.simpleMode, String(simpleMode));
  }, [locale, theme, textSize, simpleMode]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(completedLessons));
  }, [completedLessons]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.recentLessons, JSON.stringify(recentLessons));
  }, [recentLessons]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.startedPaths, JSON.stringify(startedPaths));
  }, [startedPaths]);

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
