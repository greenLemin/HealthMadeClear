// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import React, { createRef } from "react";
import { SearchDialogContent } from "./SearchDialogContent";
import type { SearchEntry } from "@/types/search";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

describe("SearchDialogContent", () => {
  const mockClose = vi.fn();
  const mockSetQuery = vi.fn();
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      searchDialog: "Search Dialog",
      close: "Close search",
      placeholder: "Type to search...",
      escapeKey: "ESC",
      typeLesson: "Lesson",
      typeArticle: "Article",
      typeGlossary: "Glossary Term",
      typePath: "Learning Path",
      typeTool: "Tool",
    };
    return translations[key] || key;
  });

  const defaultProps = {
    t: mockT as any,
    close: mockClose,
    inputRef: createRef<HTMLInputElement>(),
    query: "",
    setQuery: mockSetQuery,
    results: [],
    noResultsTitle: "No results found",
    noResultsDescription: "Try searching for something else",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header, input, placeholder, and escape key label", () => {
    render(<SearchDialogContent {...defaultProps} query="health" />);

    expect(screen.getByRole("heading", { name: "Search Dialog" })).toBeInTheDocument();
    expect(screen.getAllByText("Search Dialog")).toHaveLength(2);

    const input = screen.getByPlaceholderText("Type to search...") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("health");

    expect(screen.getByText("ESC")).toBeInTheDocument();
  });

  it("attaches the inputRef to the search input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchDialogContent {...defaultProps} inputRef={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe("INPUT");
  });

  it("calls setQuery when typing in search input", () => {
    render(<SearchDialogContent {...defaultProps} />);

    const input = screen.getByPlaceholderText("Type to search...");
    fireEvent.change(input, { target: { value: "diabetes" } });

    expect(mockSetQuery).toHaveBeenCalledWith("diabetes");
  });

  it("calls close when close button is clicked", () => {
    render(<SearchDialogContent {...defaultProps} />);

    const closeBtn = screen.getByRole("button", { name: "Close search" });
    fireEvent.click(closeBtn);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("renders EmptyState when results array is empty", () => {
    render(
      <SearchDialogContent
        {...defaultProps}
        results={[]}
        noResultsTitle="Custom Empty Title"
        noResultsDescription="Custom Empty Description"
      />
    );

    expect(screen.getByText("Custom Empty Title")).toBeInTheDocument();
    expect(screen.getByText("Custom Empty Description")).toBeInTheDocument();
  });

  it("renders search results and handles type labels for all entry types", () => {
    const results: SearchEntry[] = [
      {
        id: "1",
        type: "lesson",
        title: "Understanding Blood Pressure",
        description: "Learn about BP numbers",
        category: "Cardiology",
        categoryId: "cardiology",
        content: "Content 1",
        url: "/en/learn/bp",
      },
      {
        id: "2",
        type: "article",
        title: "Heart Health Article",
        description: "Article on heart health",
        category: "Cardiology",
        categoryId: "cardiology",
        content: "Content 2",
        url: "/en/articles/heart",
      },
      {
        id: "3",
        type: "glossary",
        title: "Hypertension",
        description: "High blood pressure definition",
        category: "Terms",
        categoryId: "terms",
        content: "Content 3",
        url: "/en/glossary/hypertension",
      },
      {
        id: "4",
        type: "path",
        title: "Cardiovascular Path",
        description: "Complete learning path for cardiovascular care",
        category: "Paths",
        categoryId: "paths",
        content: "Content 4",
        url: "/en/learning-paths/cardio",
      },
      {
        id: "5",
        type: "tool",
        title: "BP Monitor Tool",
        description: "Track your blood pressure readings",
        category: "Tools",
        categoryId: "tools",
        content: "Content 5",
        url: "/en/tools/bp-monitor",
      },
      {
        id: "6",
        type: "unknown_type" as any,
        title: "Custom Resource",
        description: "Resource with fallback type label",
        category: "General",
        categoryId: "general",
        content: "Content 6",
        url: "/en/custom",
      },
    ];

    render(<SearchDialogContent {...defaultProps} results={results} />);

    expect(screen.getByText("Lesson")).toBeInTheDocument();
    expect(screen.getByText("Article")).toBeInTheDocument();
    expect(screen.getByText("Glossary Term")).toBeInTheDocument();
    expect(screen.getByText("Learning Path")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
    expect(screen.getByText("unknown_type")).toBeInTheDocument();

    expect(screen.getByText("Understanding Blood Pressure")).toBeInTheDocument();
    expect(screen.getByText("Learn about BP numbers")).toBeInTheDocument();
  });

  it("highlights search query matches in title, description, and category", () => {
    const results: SearchEntry[] = [
      {
        id: "1",
        type: "lesson",
        title: "Heart Health Basics",
        description: "Learn about Heart wellness",
        category: "Heart Care",
        categoryId: "heart-care",
        content: "Content 1",
        url: "/en/learn/heart",
      },
    ];

    render(<SearchDialogContent {...defaultProps} query="Heart" results={results} />);

    const marks = screen.getAllByText("Heart");
    expect(marks.length).toBeGreaterThanOrEqual(3);
    marks.forEach((mark) => {
      expect(mark.tagName.toLowerCase()).toBe("mark");
    });
  });

  it("calls close when a result link is clicked", () => {
    const results: SearchEntry[] = [
      {
        id: "1",
        type: "lesson",
        title: "Understanding Blood Pressure",
        description: "Learn about BP numbers",
        category: "Cardiology",
        categoryId: "cardiology",
        content: "Content 1",
        url: "/en/learn/bp",
      },
    ];

    render(<SearchDialogContent {...defaultProps} results={results} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/en/learn/bp");

    fireEvent.click(link);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
