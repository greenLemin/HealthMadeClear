import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LearningPathDetailClient from "./LearningPathDetailClient";
import type { LearningPath } from "@/types/learningPath";
import type { Lesson } from "@/types/lesson";

// Mocks
vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({ locale: "en" }),
}));

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    completedLessonIds: ["lesson-1"],
    getLearningPathProgress: (ids: string[]) => ({
      completed: 1,
      total: ids.length,
      percentage: Math.round((1 / ids.length) * 100),
    }),
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      paths: {
        pageTitle: "Learning Paths",
        pageBadge: "Path",
        includedLessons: "Included Lessons",
        progressLabel: "Your Progress",
        complete: "complete",
        upNext: "Up Next",
        continue: "Continue",
        startPath: "Start Path",
        lesson: "Lesson",
      },
      common: {
        of: "of",
        start: "Start",
        completed: "Completed",
        read: "Read",
      },
      nav: {
        home: "Home",
      },
      tools: {
        step: "Step",
      },
    };
    return translations[namespace]?.[key] ?? key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/Callout", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => <div>Medical Disclaimer</div>,
}));

vi.mock("@/components/mdx/MarkdownRenderer", () => ({
  default: ({ text }: any) => <div>{text}</div>,
}));

describe("LearningPathDetailClient", () => {
  const mockPath = {
    id: "safer-medicine-use",
    slug: "safer-medicine-use",
    title: "Test Path",
    description: "Test path description",
    duration: "15 min",
    level: "beginner",
    category: "medications",
    lessons: ["lesson-1", "lesson-2"],
    content: {
      sections: [{ title: "Section 1", content: "Section 1 Content" }],
    },
  } as unknown as LearningPath;

  const mockLessons: Lesson[] = [
    {
      id: "lesson-1",
      slug: "lesson-1",
      title: "First Lesson",
      description: "Description 1",
      duration: "5 min",
      level: "beginner",
      categoryId: "medications",
      content: { sections: [] },
    } as unknown as Lesson,
    {
      id: "lesson-2",
      slug: "lesson-2",
      title: "Second Lesson",
      description: "Description 2",
      duration: "10 min",
      level: "beginner",
      categoryId: "medications",
      content: { sections: [] },
    } as unknown as Lesson,
  ];

  it("renders path details, lesson list, and correctly identifies next uncompleted lesson", () => {
    render(<LearningPathDetailClient path={mockPath} lessons={mockLessons} glossaryTerms={[]} />);

    expect(screen.getByRole("heading", { level: 1, name: "Test Path" })).toBeInTheDocument();
    expect(screen.getByText("First Lesson")).toBeInTheDocument();
    expect(screen.getAllByText("Second Lesson")).toHaveLength(2);
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("stacks lesson cards below sm and shows Step X of Y badges", () => {
    render(<LearningPathDetailClient path={mockPath} lessons={mockLessons} glossaryTerms={[]} />);

    const firstLessonLink = screen.getByRole("link", { name: /First Lesson/ });
    expect(firstLessonLink.className).toMatch(/flex-col/);
    expect(firstLessonLink.className).toMatch(/sm:flex-row/);
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 2")).toHaveClass("sm:hidden");
  });
});
