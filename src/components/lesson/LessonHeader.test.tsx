// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import LessonHeader from "./LessonHeader";
import type { Lesson } from "@/types/lesson";
import { shareCurrentPage } from "@/lib/shareCurrentPage";

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

vi.mock("@/components/LessonThumbnail", () => ({
  default: () => <div data-testid="lesson-thumbnail" />,
}));

vi.mock("@/components/ui/ToastProvider", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/lib/shareCurrentPage", () => ({
  shareCurrentPage: vi.fn(),
}));

const lesson: Lesson = {
  id: "reading-nutrition-labels",
  title: "Reading a Nutrition Label",
  description: "Learn how to read nutrition labels to make informed food choices.",
  category: "Nutrition & Diet",
  categoryId: "nutrition",
  duration: "10 minutes",
  level: "beginner",
  lastReviewed: "2026-06-01",
  reviewedBy: "RN Health Education Team",
  sources: ["FDA - Nutrition Facts Label", "USDA Dietary Guidelines"],
  content: { sections: [{ title: "Intro", content: "Body" }] },
};

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <LessonHeader
        lesson={lesson}
        locale="en"
        reviewedDate="June 1, 2026"
        isComplete={false}
        isSaving={false}
        onMarkComplete={() => undefined}
        hasQuiz={false}
        bestQuizScore={null}
        lessonId={lesson.id}
      />
    </NextIntlClientProvider>
  );
}

describe("LessonHeader", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows a compact review and source line after the title", () => {
    renderHeader();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(lesson.title);
    const compact = screen.getByText(/Reviewed by RN Health Education Team/);
    expect(compact.tagName).toBe("P");
    expect(compact).toHaveTextContent(
      "Reviewed by RN Health Education Team · June 1, 2026 · Sources: FDA - Nutrition Facts Label / USDA Dietary Guidelines"
    );
  });

  it("renders Print, copy link, and a separate Share on X control", () => {
    renderHeader();

    const printButton = screen.getByRole("button", { name: en.common.print });
    expect(printButton).toHaveClass("no-print");
    expect(screen.getByRole("button", { name: en.common.copyLink })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.common.shareOnX })).toBeInTheDocument();
  });

  it("copy link uses shareCurrentPage and X intent stays a separate window.open", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: en.common.copyLink }));
    expect(shareCurrentPage).toHaveBeenCalledWith(
      expect.objectContaining({
        url: window.location.href,
        title: lesson.title,
      })
    );

    fireEvent.click(screen.getByRole("button", { name: en.common.shareOnX }));
    expect(open).toHaveBeenCalledWith(
      expect.stringContaining("https://twitter.com/intent/tweet"),
      "_blank",
      "noopener,noreferrer"
    );
    expect(shareCurrentPage).toHaveBeenCalledTimes(1);
  });
});
