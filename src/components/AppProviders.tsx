"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import OnboardingDialog from "@/components/OnboardingDialog";
import ToastProvider from "@/components/ui/ToastProvider";
import {
  STORAGE_KEYS,
  applyDocumentPreferences,
  readStoredStringArray,
  readStoredSimpleMode,
  readStoredTextSize,
  readStoredTheme,
  setPreferenceCookie,
  type TextSize,
  type ThemeMode,
} from "@/lib/preferences";
import type { ExportedProgress, QuizScore } from "@/lib/progressExport";
import { readStoredQuizScores } from "@/lib/progressExport";

export type { TextSize, ThemeMode };

type AppContextValue = {
  locale: Locale;
  theme: ThemeMode;
  textSize: TextSize;
  simpleMode: boolean;
  completedLessons: string[];
  recentLessons: string[];
  startedPaths: string[];
  quizScores: QuizScore[];
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setSimpleMode: (value: boolean) => void;
  toggleLessonComplete: (lessonId: string) => void;
  markLessonViewed: (lessonId: string) => void;
  markPathStarted: (pathId: string) => void;
  markLessonComplete: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, score: number, passed: boolean) => void;
  importProgress: (data: ExportedProgress) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export default function AppProviders({
  children,
  locale: initialLocale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("standard");
  const [simpleMode, setSimpleModeState] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [recentLessons, setRecentLessons] = useState<string[]>([]);
  const [startedPaths, setStartedPaths] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLocaleState(initialLocale);

    // Load stored preferences after mount to prevent hydration mismatches

    setThemeState(readStoredTheme());

    setTextSizeState(readStoredTextSize());

    setSimpleModeState(readStoredSimpleMode());

    setCompletedLessons(readStoredStringArray(STORAGE_KEYS.completedLessons));

    setRecentLessons(readStoredStringArray(STORAGE_KEYS.recentLessons));

    setStartedPaths(readStoredStringArray(STORAGE_KEYS.startedPaths));

    setQuizScores(readStoredQuizScores());

    setHydrated(true);
  }, [initialLocale]);

  useEffect(() => {
    if (!hydrated) return;
    applyDocumentPreferences(locale, theme, textSize, simpleMode);
    document.documentElement.dataset.hydrated = "true";
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
    window.localStorage.setItem(STORAGE_KEYS.recentLessons, JSON.stringify(recentLessons));
    window.localStorage.setItem(STORAGE_KEYS.startedPaths, JSON.stringify(startedPaths));
    window.localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(quizScores));
  }, [hydrated, completedLessons, recentLessons, startedPaths, quizScores]);

  const setLocale = useCallback((value: Locale) => setLocaleState(value), []);
  const setTheme = useCallback((value: ThemeMode) => setThemeState(value), []);
  const setTextSize = useCallback((value: TextSize) => setTextSizeState(value), []);
  const setSimpleMode = useCallback((value: boolean) => setSimpleModeState(value), []);

  const toggleLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((current) =>
      current.includes(lessonId) ? current.filter((id) => id !== lessonId) : [...current, lessonId]
    );
  }, []);

  const markLessonViewed = useCallback((lessonId: string) => {
    setRecentLessons((current) => [lessonId, ...current.filter((id) => id !== lessonId)].slice(0, 6));
  }, []);

  const markPathStarted = useCallback((pathId: string) => {
    setStartedPaths((current) => (current.includes(pathId) ? current : [...current, pathId]));
  }, []);

  const markLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((current) => (current.includes(lessonId) ? current : [...current, lessonId]));
  }, []);

  const recordQuizScore = useCallback((lessonId: string, score: number, passed: boolean) => {
    const entry: QuizScore = {
      lessonId,
      score,
      passed,
      completedAt: new Date().toISOString(),
    };
    setQuizScores((current) => {
      const without = current.filter((item) => item.lessonId !== lessonId);
      return [...without, entry];
    });
  }, []);

  const importProgress = useCallback((data: ExportedProgress) => {
    setCompletedLessons(data.completedLessons);
    setRecentLessons(data.recentLessons);
    setStartedPaths(data.startedPaths);
    setQuizScores(data.quizScores);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      theme,
      textSize,
      simpleMode,
      completedLessons,
      recentLessons,
      startedPaths,
      quizScores,
      setLocale,
      setTheme,
      setTextSize,
      setSimpleMode,
      toggleLessonComplete,
      markLessonViewed,
      markPathStarted,
      markLessonComplete,
      recordQuizScore,
      importProgress,
    }),

    [
      locale,
      theme,
      textSize,
      simpleMode,
      completedLessons,
      recentLessons,
      startedPaths,
      quizScores,
      setLocale,
      setTheme,
      setTextSize,
      setSimpleMode,
      toggleLessonComplete,
      markLessonViewed,
      markPathStarted,
      markLessonComplete,
      recordQuizScore,
      importProgress,
    ]
  );

  return (
    <AppContext.Provider value={value}>
      <ToastProvider>
        {children}
        <OnboardingDialog />
      </ToastProvider>
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppState must be used within AppProviders");
  }

  return context;
}
