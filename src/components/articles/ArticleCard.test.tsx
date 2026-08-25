import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArticleCard from "./ArticleCard";
import type { Article } from "@/types/article";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "read") return "read";
    return key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    className,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("ArticleCard", () => {
  const mockArticle: Article = {
    id: "choosing-primary-care-doctor",
    title: "Choosing a Primary Care Doctor",
    description: "Learn how to find and select the right primary care physician for your needs.",
    category: "Healthcare Basics",
    readingTime: "5 min",
    content: {
      sections: [
        {
          title: "Introduction",
          content: "A primary care doctor is your main health partner.",
        },
      ],
    },
  };

  it("renders the article title, description, and category", () => {
    render(<ArticleCard article={mockArticle} />);

    expect(screen.getByText("Choosing a Primary Care Doctor")).toBeInTheDocument();
    expect(
      screen.getByText("Learn how to find and select the right primary care physician for your needs.")
    ).toBeInTheDocument();
    expect(screen.getByText("Healthcare Basics")).toBeInTheDocument();
  });

  it("renders the link with the correct article URL", () => {
    render(<ArticleCard article={mockArticle} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/articles/choosing-primary-care-doctor");
  });

  it("renders the reading time with localized label", () => {
    render(<ArticleCard article={mockArticle} />);

    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });
});
