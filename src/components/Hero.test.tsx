// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import Hero from "./Hero";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

beforeAll(() => {
  // Mock IntersectionObserver for Framer Motion / Reveal component
  const MockIntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  (window as any).IntersectionObserver = MockIntersectionObserver;
});

describe("Hero", () => {
  const renderComponent = () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>
    );
  };

  it("renders the hero content", () => {
    renderComponent();
    expect(screen.getByText(en.hero.badge)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(en.hero.title);
    expect(screen.getByText(en.hero.subtitle)).toBeInTheDocument();
  });

  it("renders action buttons", () => {
    renderComponent();
    expect(screen.getByRole("link", { name: en.hero.startLearning })).toHaveAttribute(
      "href",
      "/learning-paths"
    );
    expect(screen.getByRole("link", { name: en.hero.browseGlossary })).toHaveAttribute("href", "/glossary");
  });

  it("renders metric pills and cards", () => {
    renderComponent();
    expect(screen.getAllByText(en.hero.preparedVisits).length).toBeGreaterThan(0);
    expect(screen.getAllByText(en.hero.clearLessons).length).toBeGreaterThan(0);
    expect(screen.getByText(en.hero.preparedVisitsBody)).toBeInTheDocument();
    expect(screen.getByText(en.hero.clearLessonsBody)).toBeInTheDocument();
  });
});
