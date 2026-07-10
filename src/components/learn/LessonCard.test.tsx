// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import LessonCard from "./LessonCard";
import AppProviders from "@/components/AppProviders";
import type { LessonListItem } from "@/types/lesson";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/current-path",
  useRouter: () => ({
    replace: vi.fn(),
  }),
  Link: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} data-testid="mock-link" {...props}>
      {children}
    </a>
  ),
}));

const mockLesson: LessonListItem = {
  id: "why-preventive-care-matters",
  title: "Test Lesson",
  description: "This is a test lesson.",
  categoryId: "preventive-care",
  category: "Preventive Care",
  duration: "5 min",
  level: "beginner",
};

describe("LessonCard", () => {
  const renderComponent = (props: { lesson?: LessonListItem; isComplete?: boolean } = {}) => {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <LessonCard lesson={props.lesson || mockLesson} isComplete={props.isComplete} />
        </AppProviders>
      </NextIntlClientProvider>
    );
  };

  it("renders correctly with basic lesson details", () => {
    renderComponent();
    expect(screen.getByText("Test Lesson")).toBeInTheDocument();
    expect(screen.getByText("This is a test lesson.")).toBeInTheDocument();
    expect(screen.getByText("5 min")).toBeInTheDocument();
    expect(screen.getByText(en.categories["preventive-care"])).toBeInTheDocument();
    expect(screen.getByText(en.common.beginner)).toBeInTheDocument();
  });

  it("renders completed status when isComplete is true", () => {
    renderComponent({ isComplete: true });
    expect(screen.getByText(en.common.completed)).toBeInTheDocument();
  });

  it("applies intermediate difficulty styles", () => {
    const intermediateLesson: LessonListItem = {
      ...mockLesson,
      level: "intermediate",
    };
    renderComponent({ lesson: intermediateLesson });
    expect(screen.getByText(en.common.intermediate)).toBeInTheDocument();
    expect(screen.getByText(en.common.intermediate)).toHaveClass("bg-tertiary-container/30");
  });

  it("applies advanced difficulty styles", () => {
    const advancedLesson: LessonListItem = {
      ...mockLesson,
      level: "advanced",
    };
    renderComponent({ lesson: advancedLesson });
    expect(screen.getByText(en.common.advanced)).toBeInTheDocument();
    expect(screen.getByText(en.common.advanced)).toHaveClass("bg-primary-container");
  });
});
