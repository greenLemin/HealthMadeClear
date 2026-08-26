// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SearchDialogContent } from "./SearchDialogContent";
import type { SearchEntry } from "@/types/search";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/search/highlightMatches", () => ({
  highlightMatches: (text: string) => text,
}));

vi.mock("@/components/ui/EmptyState", () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
}));

describe("SearchDialogContent", () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      searchDialog: "Search",
      close: "Close",
      placeholder: "Search topics...",
      escapeKey: "ESC",
      typeLesson: "Lesson",
      typeArticle: "Article",
      typeGlossary: "Glossary",
      typePath: "Path",
      typeTool: "Tool",
    };
    return translations[key] || key;
  }) as any;

  const mockClose = vi.fn();
  const mockSetQuery = vi.fn();
  const inputRef = { current: null };

  const sampleResults: SearchEntry[] = [
    {
      id: "1",
      type: "lesson",
      title: "Understanding Blood Pressure",
      description: "Learn about systolic and diastolic pressure",
      url: "/en/learn/blood-pressure",
      category: "Cardiovascular",
      categoryId: "cardiovascular",
      content: "Full content here",
    },
    {
      id: "2",
      type: "article",
      title: "Diabetes Care",
      description: "Managing glucose levels",
      url: "/en/articles/diabetes",
      category: "Endocrinology",
      categoryId: "endocrinology",
      content: "Full content here",
    },
    {
      id: "3",
      type: "glossary",
      title: "Hypertension",
      description: "High blood pressure condition",
      url: "/en/glossary/hypertension",
      category: "Terms",
      categoryId: "terms",
      content: "Full content here",
    },
    {
      id: "4",
      type: "path",
      title: "Heart Health Path",
      description: "Step-by-step path",
      url: "/en/paths/heart-health",
      category: "Guides",
      categoryId: "guides",
      content: "Full content here",
    },
    {
      id: "5",
      type: "tool",
      title: "BP Calculator",
      description: "Calculate risk",
      url: "/en/tools/bp-calculator",
      category: "Calculator",
      categoryId: "calculator",
      content: "Full content here",
    },
    {
      id: "6",
      type: "custom" as any,
      title: "Custom Entry",
      description: "Custom description",
      url: "/en/custom",
      category: "Misc",
      categoryId: "misc",
      content: "Full content here",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, search input, and close button correctly", () => {
    render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query="blood"
        setQuery={mockSetQuery}
        results={[]}
        noResultsTitle="No results found"
        noResultsDescription="Try another query"
      />
    );

    expect(screen.getByRole("heading", { name: "Search", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("blood");
    expect(screen.getByPlaceholderText("Search topics...")).toBeInTheDocument();
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("triggers setQuery when typing in the search input", () => {
    render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query=""
        setQuery={mockSetQuery}
        results={[]}
        noResultsTitle="No results"
        noResultsDescription="No description"
      />
    );

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "heart" } });

    expect(mockSetQuery).toHaveBeenCalledWith("heart");
  });

  it("calls close function when close button is clicked", () => {
    render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query=""
        setQuery={mockSetQuery}
        results={[]}
        noResultsTitle="No results"
        noResultsDescription="No description"
      />
    );

    fireEvent.click(screen.getByLabelText("Close"));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("renders EmptyState when results array is empty", () => {
    render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query="xyz"
        setQuery={mockSetQuery}
        results={[]}
        noResultsTitle="No results found for xyz"
        noResultsDescription="Try searching for something else"
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No results found for xyz")).toBeInTheDocument();
    expect(screen.getByText("Try searching for something else")).toBeInTheDocument();
  });

  it("renders search results list and handles typeLabel mapping", () => {
    render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query="pressure"
        setQuery={mockSetQuery}
        results={sampleResults}
        noResultsTitle="No results"
        noResultsDescription="No description"
      />
    );

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByText("Understanding Blood Pressure")).toBeInTheDocument();
    expect(screen.getByText("Diabetes Care")).toBeInTheDocument();

    expect(screen.getByText("Lesson")).toBeInTheDocument();
    expect(screen.getByText("Article")).toBeInTheDocument();
    expect(screen.getByText("Glossary")).toBeInTheDocument();
    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
    expect(screen.getByText("custom")).toBeInTheDocument();
  });

  it("calls close when a result link is clicked", () => {
    render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query="blood"
        setQuery={mockSetQuery}
        results={sampleResults}
        noResultsTitle="No results"
        noResultsDescription="No description"
      />
    );

    const firstLink = screen.getByText("Understanding Blood Pressure").closest("a");
    expect(firstLink).not.toBeNull();
    fireEvent.click(firstLink!);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
