// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi, beforeEach } from "vitest";
import en from "@/messages/en.json";
import DashboardHeader from "./DashboardHeader";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import { buildProgressExport, downloadProgressExport } from "@/lib/progressExport";
import type { Summary } from "../types";

vi.mock("@/components/AppProviders", () => ({
  useAppState: vi.fn(),
}));

vi.mock("@/components/ui/ToastProvider", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/lib/progressExport", () => ({
  buildProgressExport: vi.fn(),
  downloadProgressExport: vi.fn(),
  parseProgressImport: vi.fn(),
  applyProgressImport: vi.fn(),
}));

const mockSummary: Summary = {
  totalLessonsCompleted: 5,
  totalLessonsAvailable: 20,
  totalQuizzesPassed: 2,
  totalQuizzesAttempted: 3,
  averageQuizScore: 80,
  totalTimeSpentMinutes: 120,
  currentStreak: 2,
  longestStreak: 5,
};

describe("DashboardHeader", () => {
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      showToast: mockShowToast,
    });

    (useAppState as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      completedLessons: new Set(["lesson-1"]),
      recentLessons: ["lesson-1"],
      startedPaths: ["path-1"],
      quizScores: [],
      importProgress: vi.fn(),
    });
  });

  const renderComponent = () =>
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DashboardHeader summary={mockSummary} displayName="John Doe" />
      </NextIntlClientProvider>
    );

  it("handles successful progress export", () => {
    const mockData = { version: 2 } as any;
    (buildProgressExport as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockData);

    renderComponent();

    const exportButton = screen.getByRole("button", { name: "Export progress" });
    fireEvent.click(exportButton);

    expect(buildProgressExport).toHaveBeenCalledWith(["lesson-1"], ["lesson-1"], ["path-1"], []);
    expect(downloadProgressExport).toHaveBeenCalledWith(mockData);
    expect(mockShowToast).toHaveBeenCalledWith("success", en.dashboard.exportSuccess);
  });

  it("handles error during progress export", () => {
    (buildProgressExport as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error("Export failed");
    });

    renderComponent();

    const exportButton = screen.getByRole("button", { name: "Export progress" });
    fireEvent.click(exportButton);

    expect(buildProgressExport).toHaveBeenCalled();
    expect(downloadProgressExport).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith("error", en.dashboard.exportError);
  });
});
