// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import DashboardStats from "./DashboardStats";
import type { Summary } from "@/types/dashboard";

const baseSummary: Summary = {
  totalLessonsCompleted: 5,
  totalLessonsAvailable: 20,
  totalQuizzesPassed: 2,
  totalQuizzesAttempted: 3,
  averageQuizScore: 80,
  totalTimeSpentMinutes: 0,
  currentStreak: 2,
  longestStreak: 5,
};

function renderStats(summary: Summary) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <DashboardStats summary={summary} locale="en" />
    </NextIntlClientProvider>
  );
}

describe("DashboardStats", () => {
  it("shows an em dash when time spent is unused (0 minutes)", () => {
    renderStats(baseSummary);
    expect(screen.getByText(en.dashboard.statsTimeSpentUnavailable)).toBeInTheDocument();
    expect(screen.queryByText("0 min")).not.toBeInTheDocument();
  });

  it("shows formatted duration when time spent is non-zero", () => {
    renderStats({ ...baseSummary, totalTimeSpentMinutes: 45 });
    expect(screen.getByText("45 min")).toBeInTheDocument();
    expect(screen.queryByText(en.dashboard.statsTimeSpentUnavailable)).not.toBeInTheDocument();
  });
});
