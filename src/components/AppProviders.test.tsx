// @vitest-environment jsdom
import { render, screen, act } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { Profiler } from "react";
import en from "@/messages/en.json";
import AppProviders, { useAppState, usePreferences, useProgressContext } from "@/components/AppProviders";
import { STORAGE_KEYS } from "@/lib/preferences";

vi.mock("@/components/OnboardingDialog", () => ({
  default: () => null,
}));

function Consumer() {
  const { completedLessons, toggleLessonComplete } = useAppState();
  return (
    <div>
      <span data-testid="count">{completedLessons.size}</span>
      <button type="button" onClick={() => toggleLessonComplete("lesson-a")}>
        toggle
      </button>
    </div>
  );
}

function QuizConsumer() {
  const { quizScores, recordQuizScore } = useAppState();
  const score = quizScores.find((q) => q.lessonId === "x")?.score ?? -1;
  return (
    <div>
      <span data-testid="score">{score}</span>
      <button type="button" onClick={() => recordQuizScore("x", 100, true)}>
        high
      </button>
      <button type="button" onClick={() => recordQuizScore("x", 60, false)}>
        low
      </button>
    </div>
  );
}

function ResetConsumer() {
  const { completedLessons, toggleLessonComplete, resetLocalProgress, wipeGeneration } = useAppState();
  return (
    <div>
      <span data-testid="count">{completedLessons.size}</span>
      <span data-testid="gen">{wipeGeneration}</span>
      <button type="button" onClick={() => toggleLessonComplete("lesson-a")}>
        toggle
      </button>
      <button type="button" onClick={resetLocalProgress}>
        reset
      </button>
    </div>
  );
}

describe("AppProviders", () => {
  beforeEach(() => {
    window.localStorage.clear();
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0]?.trim();
      if (name) {
        document.cookie = `${name}=;path=/;max-age=0`;
      }
    }
  });

  it("hydrates and persists completed lessons", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <Consumer />
        </AppProviders>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("count").textContent).toBe("0");

    await act(async () => {
      screen.getByRole("button", { name: "toggle" }).click();
    });

    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.completedLessons) ?? "[]")).toContain(
      "lesson-a"
    );
  });

  it("recordQuizScore keep-best: lower retake does not overwrite higher score", async () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <QuizConsumer />
        </AppProviders>
      </NextIntlClientProvider>
    );

    await act(async () => {
      screen.getByRole("button", { name: "high" }).click();
    });
    expect(screen.getByTestId("score").textContent).toBe("100");

    await act(async () => {
      screen.getByRole("button", { name: "low" }).click();
    });
    expect(screen.getByTestId("score").textContent).toBe("100");
  });

  it("resetLocalProgress empties React state, increments wipeGeneration, and persist effect writes []", async () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, "dark");

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <ResetConsumer />
        </AppProviders>
      </NextIntlClientProvider>
    );

    await act(async () => {
      screen.getByRole("button", { name: "toggle" }).click();
    });
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("gen").textContent).toBe("0");

    await act(async () => {
      screen.getByRole("button", { name: "reset" }).click();
    });

    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("gen").textContent).toBe("1");
    expect(window.localStorage.getItem(STORAGE_KEYS.completedLessons)).toBe("[]");
  });

  it("useAppState compat hook still merges preferences and progress", async () => {
    function MergedConsumer() {
      const { locale, theme, completedLessons, wipeGeneration, setTheme, toggleLessonComplete } =
        useAppState();
      return (
        <div>
          <span data-testid="locale">{locale}</span>
          <span data-testid="theme">{theme}</span>
          <span data-testid="count">{completedLessons.size}</span>
          <span data-testid="gen">{wipeGeneration}</span>
          <button type="button" onClick={() => setTheme("dark")}>
            theme
          </button>
          <button type="button" onClick={() => toggleLessonComplete("lesson-a")}>
            toggle
          </button>
        </div>
      );
    }

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <MergedConsumer />
        </AppProviders>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("locale").textContent).toBe("en");
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("gen").textContent).toBe("0");

    await act(async () => {
      screen.getByRole("button", { name: "theme" }).click();
      screen.getByRole("button", { name: "toggle" }).click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("preference updates do not re-render progress-only consumers", async () => {
    let prefsRenders = 0;
    let progressRenders = 0;

    function PrefsConsumer() {
      const { theme, setTheme } = usePreferences();
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <button type="button" onClick={() => setTheme("dark")}>
            theme
          </button>
        </div>
      );
    }

    function ProgressConsumer() {
      const { completedLessons } = useProgressContext();
      return <span data-testid="count">{completedLessons.size}</span>;
    }

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <Profiler
            id="prefs"
            onRender={() => {
              prefsRenders += 1;
            }}
          >
            <PrefsConsumer />
          </Profiler>
          <Profiler
            id="progress"
            onRender={() => {
              progressRenders += 1;
            }}
          >
            <ProgressConsumer />
          </Profiler>
        </AppProviders>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("light");
    const progressRendersAfterHydrate = progressRenders;

    await act(async () => {
      screen.getByRole("button", { name: "theme" }).click();
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(progressRenders).toBe(progressRendersAfterHydrate);
    expect(prefsRenders).toBeGreaterThan(0);
  });

  it("progress updates do not re-render preference-only consumers", async () => {
    let prefsRenders = 0;
    let progressRenders = 0;

    function PrefsConsumer() {
      const { theme } = usePreferences();
      return <span data-testid="theme">{theme}</span>;
    }

    function ProgressConsumer() {
      const { completedLessons, toggleLessonComplete } = useProgressContext();
      return (
        <div>
          <span data-testid="count">{completedLessons.size}</span>
          <button type="button" onClick={() => toggleLessonComplete("lesson-a")}>
            toggle
          </button>
        </div>
      );
    }

    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <Profiler
            id="prefs"
            onRender={() => {
              prefsRenders += 1;
            }}
          >
            <PrefsConsumer />
          </Profiler>
          <Profiler
            id="progress"
            onRender={() => {
              progressRenders += 1;
            }}
          >
            <ProgressConsumer />
          </Profiler>
        </AppProviders>
      </NextIntlClientProvider>
    );

    expect(screen.getByTestId("count").textContent).toBe("0");
    const prefsRendersAfterHydrate = prefsRenders;

    await act(async () => {
      screen.getByRole("button", { name: "toggle" }).click();
    });

    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(prefsRenders).toBe(prefsRendersAfterHydrate);
  });
});
