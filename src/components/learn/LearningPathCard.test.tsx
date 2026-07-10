// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAppState } from "@/components/AppProviders";

// Mock ALL potential next/navigation imports BEFORE any component imports
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => ""),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => ""),
  Link: ({ children, href, className, onClick }: any) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

import LearningPathCard from "./LearningPathCard";
import type { LearningPath } from "@/types/learningPath";
import type { LessonListItem } from "@/types/lesson";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

vi.mock("@/components/AppProviders", () => ({
  useAppState: vi.fn(() => ({
    locale: "en",
    completedLessons: new Set(),
  })),
}));

vi.mock("@/lib/i18n", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    formatLevel: vi.fn((level) => `Level: ${level}`),
  };
});

vi.mock("@/components/ui/ProgressBar", () => ({
  default: ({ value, label }: { value: number; label: string }) => (
    <div data-testid="mock-progress-bar" data-value={value}>
      {label}
    </div>
  ),
}));

vi.mock("@/lib/content", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    getLessonsByPath: vi.fn((pathId, lessons) => lessons),
  };
});

const mockPath: LearningPath = {
  id: "safer-medicine-use",
  title: "Test Path",
  description: "Test Description",
  duration: "2 hours",
  level: "beginner",
  icon: "🚀",
  lessons: ["asking-about-medications", "managing-side-effects"],
};

const mockLessons: LessonListItem[] = [
  {
    id: "asking-about-medications",
    title: "Lesson 1",
    description: "",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "1h",
    level: "beginner",
  },
  {
    id: "managing-side-effects",
    title: "Lesson 2",
    description: "",
    category: "Medication Safety",
    categoryId: "medication-safety",
    duration: "1h",
    level: "beginner",
  },
];

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
};

describe("LearningPathCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly with explicit progress", () => {
    renderWithProvider(
      <LearningPathCard
        path={mockPath}
        lessons={mockLessons}
        progress={{ completed: 1, total: 2, percentage: 50 }}
      />
    );

    expect(screen.getByText("Test Path")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Level: beginner")).toBeInTheDocument();
    expect(screen.getByText("2 hours")).toBeInTheDocument();

    const progressBar = screen.getByTestId("mock-progress-bar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("data-value", "50");
    expect(screen.getByText("1 of 2 complete")).toBeInTheDocument();
  });

  it("renders 'Start Path' button when 0 lessons completed", () => {
    renderWithProvider(
      <LearningPathCard
        path={mockPath}
        lessons={mockLessons}
        progress={{ completed: 0, total: 2, percentage: 0 }}
      />
    );
    expect(screen.getByText(/Start path/i)).toBeInTheDocument();
  });

  it("renders 'Continue' button when started but not completed", () => {
    renderWithProvider(
      <LearningPathCard
        path={mockPath}
        lessons={mockLessons}
        progress={{ completed: 1, total: 2, percentage: 50 }}
      />
    );
    expect(screen.getByText(/Continue/i)).toBeInTheDocument();
  });

  it("renders 'Completed ✓' text when all lessons completed", () => {
    renderWithProvider(
      <LearningPathCard
        path={mockPath}
        lessons={mockLessons}
        progress={{ completed: 2, total: 2, percentage: 100 }}
      />
    );
    expect(screen.getByText(/Completed/i)).toBeInTheDocument();
  });

  it("renders correctly without explicit progress, using app state calculation", () => {
    vi.mocked(useAppState).mockReturnValueOnce({
      locale: "en",
      completedLessons: new Set(["asking-about-medications"]),
    } as any);

    renderWithProvider(<LearningPathCard path={mockPath} lessons={mockLessons} />);

    const progressBar = screen.getByTestId("mock-progress-bar");
    expect(progressBar).toHaveAttribute("data-value", "50");
    expect(screen.getByText("1 of 2 complete")).toBeInTheDocument();
    expect(screen.getByText(/Continue/i)).toBeInTheDocument();
  });
});
