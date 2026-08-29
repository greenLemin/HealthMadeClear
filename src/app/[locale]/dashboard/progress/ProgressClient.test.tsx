// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import ProgressClient from "./ProgressClient";
import type { Summary } from "@/types/dashboard";

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    className,
    ...props
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("./components/CategoryProgressList", () => ({
  default: () => null,
}));

vi.mock("./components/CompletedLessonsList", () => ({
  default: () => null,
}));

vi.mock("./components/StreakCalendar", () => ({
  default: () => null,
}));

const baseSummary: Summary = {
  totalLessonsCompleted: 0,
  totalLessonsAvailable: 20,
  totalQuizzesPassed: 0,
  totalQuizzesAttempted: 0,
  averageQuizScore: 0,
  totalTimeSpentMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
};

describe("ProgressClient", () => {
  it("does not claim 0 min when time spent is unused", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ProgressClient
          summary={baseSummary}
          quizPerformance={[]}
          completedLessons={{ lessons: [], total: 0, page: 1, totalPages: 1 }}
          activeDays={[]}
          categoryProgress={[]}
          memberSince=""
          locale="en"
        />
      </NextIntlClientProvider>
    );

    expect(screen.getAllByText(en.dashboard.statsTimeSpentUnavailable).length).toBeGreaterThan(0);
    expect(screen.queryByText("0 min")).not.toBeInTheDocument();
  });
});
