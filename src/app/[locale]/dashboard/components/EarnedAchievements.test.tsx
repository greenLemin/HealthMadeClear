// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import EarnedAchievements from "./EarnedAchievements";
import type { AchievementItem } from "@/types/dashboard";

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

const earned: AchievementItem = {
  id: "first-lesson",
  title: "First lesson",
  description: "Completed a lesson",
  icon: "🏅",
  earned: true,
  earnedAt: "2026-08-01T00:00:00.000Z",
};

describe("EarnedAchievements", () => {
  it("shows EmptyState and a /learn CTA when there are no achievements", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <EarnedAchievements earnedAchievements={[]} locale="en" />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(en.dashboard.emptyAchievementsTitle)).toBeInTheDocument();
    expect(screen.getByText(en.dashboard.emptyAchievementsBody)).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: en.dashboard.emptyAchievementsCta });
    expect(cta).toHaveAttribute("href", "/learn");
    expect(screen.queryByText(en.dashboard.viewAllAchievements)).not.toBeInTheDocument();
  });

  it("renders earned achievement cards when the list is not empty", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <EarnedAchievements earnedAchievements={[earned]} locale="en" />
      </NextIntlClientProvider>
    );

    expect(screen.getByText("First lesson")).toBeInTheDocument();
    expect(screen.queryByText(en.dashboard.emptyAchievementsTitle)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: `${en.dashboard.viewAllAchievements} →` })).toHaveAttribute(
      "href",
      "/dashboard/achievements"
    );
  });
});
