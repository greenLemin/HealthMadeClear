// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi, beforeEach } from "vitest";
import en from "@/messages/en.json";
import AchievementCard, { AchievementItem } from "./AchievementCard";

vi.mock("@/lib/i18n", () => ({
  formatRelativeDate: vi.fn((date) => `formatted-${date}`),
}));

describe("AchievementCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (achievement: AchievementItem) => {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AchievementCard achievement={achievement} />
      </NextIntlClientProvider>
    );
  };

  it("renders an unlocked achievement correctly", () => {
    const unlockedAchievement: AchievementItem = {
      id: "test-unlocked",
      title: "Test Unlocked",
      description: "Test description unlocked",
      icon: "🌟",
      earned: true,
      earnedAt: "2024-01-01T12:00:00.000Z",
    };

    renderComponent(unlockedAchievement);

    expect(screen.getByText("Test Unlocked")).toBeInTheDocument();
    expect(screen.getByText("Test description unlocked")).toBeInTheDocument();
    expect(screen.getByText("🌟")).toBeInTheDocument();

    // It renders formatRelativeDate in two places for earned achievements (top right badge, bottom text)
    const formattedDateElements = screen.getAllByText("formatted-2024-01-01T12:00:00.000Z");
    expect(formattedDateElements.length).toBe(2);
  });

  it("renders a locked achievement correctly", () => {
    const lockedAchievement: AchievementItem = {
      id: "test-locked",
      title: "Test Locked",
      description: "Test description locked",
      icon: "🔒",
      earned: false,
      earnedAt: null,
    };

    renderComponent(lockedAchievement);

    expect(screen.getByText("Test Locked")).toBeInTheDocument();
    // It renders keepLearning text in three places (top right badge, description fallback if empty, bottom text)
    // but here description is provided, so it will show "Test description locked" and "keepLearning" in two places
    expect(screen.getByText("Test description locked")).toBeInTheDocument();
    const keepLearningElements = screen.getAllByText(en.achievements.keepLearning);
    expect(keepLearningElements.length).toBe(2);
    expect(screen.getByText("🔒")).toBeInTheDocument();
  });

  it("renders a locked achievement without description falling back to keepLearning", () => {
    const lockedAchievement: AchievementItem = {
      id: "test-locked-no-desc",
      title: "Test Locked No Desc",
      description: "",
      icon: "🔒",
      earned: false,
      earnedAt: null,
    };

    renderComponent(lockedAchievement);

    expect(screen.getByText("Test Locked No Desc")).toBeInTheDocument();
    // Since description is empty, the fallback is also keepLearning, making it 3 times total
    const keepLearningElements = screen.getAllByText(en.achievements.keepLearning);
    expect(keepLearningElements.length).toBe(3);
  });
});
