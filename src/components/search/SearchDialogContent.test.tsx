// @vitest-environment jsdom
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { ComponentProps } from "react";
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
  const mockT = vi.fn((key: string, values?: { count?: number }) => {
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
      loadingIndex: "Loading search…",
      groupLessons: "Lessons",
      groupPaths: "Paths",
      groupArticles: "Articles",
      groupGlossary: "Glossary",
      groupTools: "Tools",
    };
    if (key === "resultsFound") return `${values?.count ?? 0} results found`;
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

  function renderContent(overrides: Partial<ComponentProps<typeof SearchDialogContent>> = {}) {
    return render(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query="blood"
        setQuery={mockSetQuery}
        results={[]}
        indexStatus="ready"
        noResultsTitle="No results found"
        noResultsDescription="Try another query"
        {...overrides}
      />
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, search input, and close button correctly", () => {
    renderContent({ query: "blood", results: [] });

    expect(screen.getByRole("heading", { name: "Search", hidden: true })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("blood");
    expect(screen.getByPlaceholderText("Search topics...")).toBeInTheDocument();
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("triggers setQuery when typing in the search input", () => {
    renderContent({ query: "", results: [] });

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "heart" } });

    expect(mockSetQuery).toHaveBeenCalledWith("heart");
  });

  it("calls close function when close button is clicked", () => {
    renderContent({ query: "", results: [] });

    fireEvent.click(screen.getByLabelText("Close"));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("renders EmptyState when results array is empty and query is non-empty", () => {
    renderContent({
      query: "xyz",
      results: [],
      noResultsTitle: "No results found for xyz",
      noResultsDescription: "Try searching for something else",
    });

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No results found for xyz")).toBeInTheDocument();
    expect(screen.getByText("Try searching for something else")).toBeInTheDocument();
  });

  it("does not show empty miss while the index is loading with an empty query", () => {
    renderContent({ query: "", results: [], indexStatus: "loading" });

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByText("Loading search…")).toBeInTheDocument();
  });

  it("does not show empty miss for an empty query when ready with no results", () => {
    renderContent({ query: "", results: [], indexStatus: "ready" });

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
  });

  it("groups results in lesson/path/article/glossary/tool order with Other last", () => {
    const { container } = renderContent({ query: "pressure", results: sampleResults });

    expect(screen.queryByTestId("empty-state")).not.toBeInTheDocument();
    expect(screen.getByText("Understanding Blood Pressure")).toBeInTheDocument();
    expect(screen.getByText("Diabetes Care")).toBeInTheDocument();

    const headings = screen.getAllByRole("heading", { level: 3 }).map((node) => node.textContent);
    expect(headings).toEqual([
      "Lessons (1)",
      "Paths (1)",
      "Articles (1)",
      "Glossary (1)",
      "Tools (1)",
      "Other (1)",
    ]);

    expect(screen.getByText("Lesson")).toBeInTheDocument();
    expect(screen.getByText("Article")).toBeInTheDocument();
    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
    expect(screen.getByText("custom")).toBeInTheDocument();

    const panel = container.querySelector(".overscroll-contain");
    expect(panel).toHaveClass("max-h-[calc(100svh-12rem)]", "overflow-y-auto", "overscroll-contain");
    expect(panel?.className).not.toMatch(/100dvh|62vh/);
  });

  it("uses existing border tokens on group wrappers", () => {
    const { container } = renderContent({ query: "pressure", results: sampleResults });
    const sections = container.querySelectorAll("section");
    expect(sections[0]).toHaveClass("border-l-4", "border-primary");
    expect(sections[1]).toHaveClass("border-l-4", "border-secondary");
    expect(sections[2]).toHaveClass("border-l-4", "border-error");
    expect(sections[3]).toHaveClass("border-l-4", "border-primary-container");
    expect(sections[4]).toHaveClass("border-l-4", "border-outline-variant");
    expect(sections[5]).toHaveClass("border-l-4", "border-outline-variant");
  });

  it("announces result count on a stable live region after 350ms", () => {
    vi.useFakeTimers();
    const { rerender } = renderContent({ query: "eob", results: sampleResults });

    const live = document.getElementById("search-results-live");
    expect(live).not.toBeNull();
    expect(live).toHaveAttribute("role", "status");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent("");

    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(live).toHaveTextContent("6 results found");

    rerender(
      <SearchDialogContent
        t={mockT}
        close={mockClose}
        inputRef={inputRef}
        query="eob"
        setQuery={mockSetQuery}
        results={sampleResults.slice(0, 2)}
        indexStatus="ready"
        noResultsTitle="No results found"
        noResultsDescription="Try another query"
      />
    );

    expect(document.getElementById("search-results-live")).toBe(live);

    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(live).toHaveTextContent("2 results found");
    vi.useRealTimers();
  });

  it("calls close when a result link is clicked", () => {
    renderContent({ query: "blood", results: sampleResults });

    const firstLink = screen.getByText("Understanding Blood Pressure").closest("a");
    expect(firstLink).not.toBeNull();
    fireEvent.click(firstLink!);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
