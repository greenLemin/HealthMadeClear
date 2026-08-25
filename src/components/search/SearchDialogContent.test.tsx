/**
 * @vitest-environment jsdom
 */
import React, { createRef } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchDialogContent } from "./SearchDialogContent";
import type { SearchEntry } from "@/types/search";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, onClick, className }: any) => (
    <a href={href} onClick={onClick} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}));

describe("SearchDialogContent", () => {
  const mockT = vi.fn((key: string) => {
    const translations: Record<string, string> = {
      searchDialog: "Search Dialog",
      close: "Close search",
      placeholder: "Search lessons, articles...",
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

  const defaultProps = {
    t: mockT,
    close: mockClose,
    inputRef: createRef<HTMLInputElement>(),
    query: "",
    setQuery: mockSetQuery,
    results: [],
    noResultsTitle: "No results found",
    noResultsDescription: "Try searching for something else.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search header, accessibility title, input, and close button", () => {
    render(<SearchDialogContent {...defaultProps} />);

    // Screen reader title
    const title = screen.getByText("Search Dialog", { selector: "#search-dialog-title" });
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("sr-only");

    // Close button
    const closeBtn = screen.getByRole("button", { name: "Close search" });
    expect(closeBtn).toBeInTheDocument();

    // Input field
    const input = screen.getByRole("searchbox", { name: "Search lessons, articles..." });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Search lessons, articles...");
    expect(input).toHaveValue("");

    // Escape shortcut indicator
    expect(screen.getByText("ESC")).toBeInTheDocument();
  });

  it("calls close function when close button is clicked", () => {
    render(<SearchDialogContent {...defaultProps} />);

    const closeBtn = screen.getByRole("button", { name: "Close search" });
    fireEvent.click(closeBtn);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("calls setQuery when input text changes", () => {
    render(<SearchDialogContent {...defaultProps} />);

    const input = screen.getByRole("searchbox", { name: "Search lessons, articles..." });
    fireEvent.change(input, { target: { value: "heart" } });

    expect(mockSetQuery).toHaveBeenCalledWith("heart");
  });

  it("renders EmptyState when results array is empty", () => {
    render(<SearchDialogContent {...defaultProps} results={[]} />);

    expect(screen.getByText("No results found")).toBeInTheDocument();
    expect(screen.getByText("Try searching for something else.")).toBeInTheDocument();
  });

  it("renders search results with correct labels for all entry types", () => {
    const results: SearchEntry[] = [
      {
        id: "1",
        type: "lesson",
        title: "Heart Health Lesson",
        description: "Learn about cardiovascular health",
        category: "Cardiology",
        categoryId: "cardio",
        content: "Content 1",
        url: "/en/learn/heart-health",
      },
      {
        id: "2",
        type: "article",
        title: "Blood Pressure Article",
        description: "Understanding hypertension",
        category: "Prevention",
        categoryId: "prev",
        content: "Content 2",
        url: "/en/articles/blood-pressure",
      },
      {
        id: "3",
        type: "glossary",
        title: "Hypertension Term",
        description: "Definition of high blood pressure",
        category: "Medical Terms",
        categoryId: "gloss",
        content: "Content 3",
        url: "/en/glossary/hypertension",
      },
      {
        id: "4",
        type: "path",
        title: "Heart Pathway",
        description: "Step by step heart guide",
        category: "Pathways",
        categoryId: "pathways",
        content: "Content 4",
        url: "/en/paths/heart",
      },
      {
        id: "5",
        type: "tool",
        title: "BMI Calculator",
        description: "Calculate your body mass index",
        category: "Interactive",
        categoryId: "tools",
        content: "Content 5",
        url: "/en/tools/bmi",
      },
      {
        id: "6",
        type: "unknown" as any,
        title: "Custom Entry",
        description: "Custom description",
        category: "General",
        categoryId: "general",
        content: "Content 6",
        url: "/en/custom",
      },
    ];

    render(<SearchDialogContent {...defaultProps} results={results} />);

    // Check titles and descriptions
    expect(screen.getByText("Heart Health Lesson")).toBeInTheDocument();
    expect(screen.getByText("Blood Pressure Article")).toBeInTheDocument();
    expect(screen.getByText("Hypertension Term")).toBeInTheDocument();

    // Check type badge labels
    expect(screen.getByText("Lesson")).toBeInTheDocument();
    expect(screen.getByText("Article")).toBeInTheDocument();
    expect(screen.getByText("Glossary")).toBeInTheDocument();
    expect(screen.getByText("Path")).toBeInTheDocument();
    expect(screen.getByText("Tool")).toBeInTheDocument();
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("highlights search query matches in title, description, and category", () => {
    const results: SearchEntry[] = [
      {
        id: "1",
        type: "lesson",
        title: "Heart Attack Symptoms",
        description: "Recognizing heart issues early",
        category: "Heart Care",
        categoryId: "cardio",
        content: "Content",
        url: "/en/learn/heart-attack",
      },
    ];

    const { container } = render(<SearchDialogContent {...defaultProps} query="heart" results={results} />);

    // Look for <mark> elements created by highlightMatches
    const marks = container.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);

    const markTexts = Array.from(marks).map((m) => m.textContent?.toLowerCase());
    expect(markTexts).toContain("heart");
  });

  it("calls close function when a search result link is clicked", () => {
    const results: SearchEntry[] = [
      {
        id: "1",
        type: "lesson",
        title: "Heart Health Lesson",
        description: "Learn about heart health",
        category: "Cardiology",
        categoryId: "cardio",
        content: "Content",
        url: "/en/learn/heart-health",
      },
    ];

    render(<SearchDialogContent {...defaultProps} results={results} />);

    const link = screen.getByTestId("mock-link");
    fireEvent.click(link);

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
