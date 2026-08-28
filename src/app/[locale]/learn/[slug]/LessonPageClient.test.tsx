// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import LessonPageClient from "./LessonPageClient";
import type { Lesson } from "@/types/lesson";
import type { LessonId } from "@/types/content";

const markLessonViewed = vi.fn();
const markLessonComplete = vi.fn();
let mockLocale: "en" | "es" = "en";

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({ locale: mockLocale, markLessonViewed }),
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    markLessonComplete,
    isLessonComplete: () => false,
    getQuizBestScore: () => null,
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/lesson/LessonHeader", () => ({
  default: () => <div data-testid="lesson-header" />,
}));

vi.mock("@/components/lesson/LessonContentSections", () => ({
  default: () => <div data-testid="lesson-sections" />,
}));

vi.mock("@/components/lesson/LessonNotes", () => ({
  default: () => null,
}));

vi.mock("@/components/lesson/LessonSidebar", () => ({
  default: () => <div data-testid="lesson-sidebar" />,
}));

vi.mock("@/components/lesson/LessonNavigation", () => ({
  default: () => null,
}));

vi.mock("@/components/lesson/LessonRelatedClient", () => ({
  default: () => null,
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => <div>Medical Disclaimer</div>,
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: ReactNode }) => <div data-reveal="true">{children}</div>,
}));

vi.mock("@/components/mdx/ScrollSpyProvider", () => ({
  ScrollSpyProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

function makeLesson(id: LessonId): Lesson {
  return {
    id,
    title: "Fixture lesson",
    description: "A lesson used in print-footer tests.",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "10 minutes",
    level: "beginner",
    lastReviewed: "2026-06-01",
    content: { sections: [{ title: "Intro", content: "Body" }] },
  };
}

function renderLesson(id: LessonId, locale: "en" | "es" = "en") {
  mockLocale = locale;
  const lesson = makeLesson(id);
  const messages = locale === "en" ? en : es;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LessonPageClient
        lesson={lesson}
        glossaryTerms={[]}
        allLessons={[lesson]}
        quiz={null}
        relatedLessons={[]}
      />
    </NextIntlClientProvider>
  );
}

function expectPrintOnlyFooter(warning: string) {
  const warningNode = screen.getByText(warning);
  const footer = warningNode.closest("[class*='print:block']");
  expect(footer).not.toBeNull();
  expect(footer!.className).toMatch(/\bhidden\b/);
  expect(footer!.className).toMatch(/print:block/);
  expect(footer!.closest("[data-reveal]")).toBeNull();
}

const HIGH_LIABILITY_SLUGS: LessonId[] = [
  "understanding-prescription-labels",
  "pain-medications-safely",
  "asking-about-medications",
];

describe("LessonPageClient", () => {
  afterEach(() => {
    cleanup();
    mockLocale = "en";
    markLessonViewed.mockClear();
    markLessonComplete.mockClear();
    vi.useRealTimers();
  });

  it("marks the lesson viewed on mount without marking complete", () => {
    renderLesson("reading-nutrition-labels");
    expect(markLessonViewed).toHaveBeenCalledTimes(1);
    expect(markLessonViewed).toHaveBeenCalledWith("reading-nutrition-labels");
    expect(markLessonComplete).not.toHaveBeenCalled();
  });

  it("renders the reading progress bar at z-[60] with a progressbar role", () => {
    renderLesson("reading-nutrition-labels");
    const bar = screen.getByRole("progressbar", { name: en.learn.readingProgress });
    expect(bar.className).toMatch(/z-\[60\]/);
    expect(bar.className).toMatch(/h-1\.5/);
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(markLessonViewed).toHaveBeenCalledWith("reading-nutrition-labels");
  });

  it("renders a print-only clinical footer outside Reveal", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    renderLesson("reading-nutrition-labels");

    expectPrintOnlyFooter(en.disclaimer.printMedicalWarning);
    const expectedDate = new Date("2026-08-28T15:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    expect(
      screen.getByText(en.disclaimer.printTimestamp.replace("{date}", expectedDate))
    ).toBeInTheDocument();
  });

  it.each(HIGH_LIABILITY_SLUGS)("uses the same print-only footer on high-liability lesson %s", (slug) => {
    renderLesson(slug);
    expectPrintOnlyFooter(en.disclaimer.printMedicalWarning);
    expect(markLessonViewed).toHaveBeenCalledWith(slug);
    expect(markLessonComplete).not.toHaveBeenCalled();
  });

  it("renders the Spanish print-only clinical footer with a locale-aware date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    renderLesson("understanding-prescription-labels", "es");

    expectPrintOnlyFooter(es.disclaimer.printMedicalWarning);
    const expectedDate = new Date("2026-08-28T15:00:00").toLocaleDateString("es-ES", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    expect(
      screen.getByText(es.disclaimer.printTimestamp.replace("{date}", expectedDate))
    ).toBeInTheDocument();
  });
});
