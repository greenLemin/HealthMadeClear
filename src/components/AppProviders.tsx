"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import OnboardingDialog from "@/components/OnboardingDialog";
import ToastProvider from "@/components/ui/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
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
import { clearLocalHealthData } from "@/lib/clearLocalHealthData";
import { logger } from "@/lib/logger";
import type { ExportedProgress, QuizScore } from "@/lib/progressExport";
import { readStoredQuizScores } from "@/lib/progressExport";

export type { TextSize, ThemeMode };

type PreferencesContextValue = {
  locale: Locale;
  theme: ThemeMode;
  textSize: TextSize;
  simpleMode: boolean;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setSimpleMode: (value: boolean) => void;
};

type ProgressContextValue = {
  completedLessons: Set<string>;
  recentLessons: string[];
  startedPaths: string[];
  quizScores: QuizScore[];
  wipeGeneration: number;
  toggleLessonComplete: (lessonId: string) => void;
  markLessonViewed: (lessonId: string) => void;
  markPathStarted: (pathId: string) => void;
  markLessonComplete: (lessonId: string) => void;
  recordQuizScore: (lessonId: string, score: number, passed: boolean) => void;
  importProgress: (data: ExportedProgress) => void;
  resetLocalProgress: () => void;
};

type AppContextValue = PreferencesContextValue & ProgressContextValue;

const PreferencesContext = createContext<PreferencesContextValue | null>(null);
const ProgressContext = createContext<ProgressContextValue | null>(null);

function PreferencesProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [textSize, setTextSizeState] = useState<TextSize>("standard");
  const [simpleMode, setSimpleModeState] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load persisted prefs after mount, blocking render until hydrated gates storage writes
    setLocaleState(initialLocale);

    // Load stored preferences after mount to prevent hydration mismatches

    setThemeState(readStoredTheme());

    setTextSizeState(readStoredTextSize());

    setSimpleModeState(readStoredSimpleMode());

    setHydrated(true);
  }, [initialLocale]);

  useEffect(() => {
    if (!hydrated) return;
    applyDocumentPreferences(locale, theme, textSize, simpleMode);
    document.documentElement.dataset.hydrated = "true";
    try {
      window.localStorage.setItem(STORAGE_KEYS.locale, locale);
    } catch (e) {
      logger.warn("Failed to persist locale preference:", e);
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch (e) {
      logger.warn("Failed to persist theme preference:", e);
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.textSize, textSize);
    } catch (e) {
      logger.warn("Failed to persist textSize preference:", e);
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.simpleMode, String(simpleMode));
    } catch (e) {
      logger.warn("Failed to persist simpleMode preference:", e);
    }
    setPreferenceCookie("hmc-locale", locale);
    setPreferenceCookie("hmc-theme", theme);
    setPreferenceCookie("hmc-text-size", textSize);
    setPreferenceCookie("hmc-simple-mode", String(simpleMode));
  }, [hydrated, locale, theme, textSize, simpleMode]);

  const setLocale = useCallback((value: Locale) => setLocaleState(value), []);
  const setTheme = useCallback((value: ThemeMode) => setThemeState(value), []);
  const setTextSize = useCallback((value: TextSize) => setTextSizeState(value), []);
  const setSimpleMode = useCallback((value: boolean) => setSimpleModeState(value), []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      theme,
      textSize,
      simpleMode,
      setLocale,
      setTheme,
      setTextSize,
      setSimpleMode,
    }),
    [locale, theme, textSize, simpleMode, setLocale, setTheme, setTextSize, setSimpleMode]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [recentLessons, setRecentLessons] = useState<string[]>([]);
  const [startedPaths, setStartedPaths] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<QuizScore[]>([]);
  const [wipeGeneration, setWipeGeneration] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Load persisted progress after mount, blocking persist until hydrated
    setCompletedLessons(new Set(readStoredStringArray(STORAGE_KEYS.completedLessons)));
    setRecentLessons(readStoredStringArray(STORAGE_KEYS.recentLessons));

    setStartedPaths(readStoredStringArray(STORAGE_KEYS.startedPaths));

    setQuizScores(readStoredQuizScores());

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.completedLessons,
        JSON.stringify(Array.from(completedLessons))
      );
    } catch (e) {
      logger.warn("Failed to persist completedLessons:", e);
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.recentLessons, JSON.stringify(recentLessons));
    } catch (e) {
      logger.warn("Failed to persist recentLessons:", e);
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.startedPaths, JSON.stringify(startedPaths));
    } catch (e) {
      logger.warn("Failed to persist startedPaths:", e);
    }
    try {
      window.localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify(quizScores));
    } catch (e) {
      logger.warn("Failed to persist quizScores:", e);
    }
  }, [hydrated, completedLessons, recentLessons, startedPaths, quizScores]);

  const toggleLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((current) => {
      const next = new Set(current);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  }, []);

  const markLessonViewed = useCallback((lessonId: string) => {
    setRecentLessons((current) => [lessonId, ...current.filter((id) => id !== lessonId)].slice(0, 6));
  }, []);

  const markPathStarted = useCallback((pathId: string) => {
    setStartedPaths((current) => (current.includes(pathId) ? current : [...current, pathId]));
  }, []);

  const markLessonComplete = useCallback((lessonId: string) => {
    setCompletedLessons((current) => {
      if (current.has(lessonId)) return current;
      const next = new Set(current);
      next.add(lessonId);
      return next;
    });
  }, []);

  const recordQuizScore = useCallback((lessonId: string, score: number, passed: boolean) => {
    setQuizScores((current) => {
      const existing = current.find((item) => item.lessonId === lessonId);
      if (existing && existing.score > score) return current;
      const entry: QuizScore = {
        lessonId,
        score,
        passed,
        completedAt: new Date().toISOString(),
      };
      const without = current.filter((item) => item.lessonId !== lessonId);
      return [...without, entry];
    });
  }, []);

  const importProgress = useCallback((data: ExportedProgress) => {
    // Clamp even validated imports so a crafted file cannot blow localStorage
    // quota or render unbounded lists. Mirrors readStoredStringArray caps.
    setCompletedLessons(new Set(data.completedLessons.filter((id) => typeof id === "string").slice(0, 500)));
    setRecentLessons(data.recentLessons.filter((id) => typeof id === "string").slice(0, 6));
    setStartedPaths(data.startedPaths.filter((id) => typeof id === "string").slice(0, 100));
    setQuizScores(Array.isArray(data.quizScores) ? data.quizScores.slice(0, 200) : []);
  }, []);

  const resetLocalProgress = useCallback(() => {
    setCompletedLessons(new Set());
    setRecentLessons([]);
    setStartedPaths([]);
    setQuizScores([]);
    clearLocalHealthData();
    setWipeGeneration((g) => g + 1);
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      completedLessons,
      recentLessons,
      startedPaths,
      quizScores,
      wipeGeneration,
      toggleLessonComplete,
      markLessonViewed,
      markPathStarted,
      markLessonComplete,
      recordQuizScore,
      importProgress,
      resetLocalProgress,
    }),
    [
      completedLessons,
      recentLessons,
      startedPaths,
      quizScores,
      wipeGeneration,
      toggleLessonComplete,
      markLessonViewed,
      markPathStarted,
      markLessonComplete,
      recordQuizScore,
      importProgress,
      resetLocalProgress,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export default function AppProviders({
  children,
  locale: initialLocale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <PreferencesProvider initialLocale={initialLocale}>
      <ProgressProvider>
        <ErrorBoundary>
          <ToastProvider>
            {children}
            <OnboardingDialog />
          </ToastProvider>
        </ErrorBoundary>
      </ProgressProvider>
    </PreferencesProvider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error("usePreferences must be used within AppProviders");
  }

  return context;
}

export function useProgressContext() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgressContext must be used within AppProviders");
  }

  return context;
}

export function useAppState(): AppContextValue {
  const preferences = useContext(PreferencesContext);
  const progress = useContext(ProgressContext);

  if (!preferences || !progress) {
    throw new Error("useAppState must be used within AppProviders");
  }

  return { ...preferences, ...progress };
}
