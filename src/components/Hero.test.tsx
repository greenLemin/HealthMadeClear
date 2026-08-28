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
    expect(screen.getByRole("note")).toHaveTextContent(en.trust.banner);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText(en.hero.badge)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(en.hero.title);
    expect(screen.getByText(en.hero.subtitle)).toBeInTheDocument();
  });

  it("clamps the H1 type scale", () => {
    renderComponent();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-[clamp(2.25rem,3.5vw+1rem,3.5rem)]", "leading-[1.1]", "mb-4");
    expect(heading.className).not.toContain("clamp(3rem,7vw,5.6rem)");
    expect(heading.className).not.toContain("leading-[0.95]");
  });

  it("does not render a video element", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>
    );
    expect(container.querySelector("video")).toBeNull();
  });

  it("uses a compact trust banner and does not add a physician badge", () => {
    renderComponent();
    const banner = screen.getByRole("note");
    expect(banner).toHaveClass("text-label-sm", "py-1", "px-3");
    expect(banner).not.toHaveTextContent(/physician|MD|doctor badge/i);
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

  it("top-aligns copy against the stitch column and crops the portrait image", () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Hero />
      </NextIntlClientProvider>
    );
    const grid = container.querySelector(".grid");
    expect(grid).toHaveClass("items-start");
    expect(grid?.className).not.toMatch(/\bitems-center\b/);

    const stitch = screen.getByRole("img", { name: en.hero.imageAlt });
    expect(stitch).toHaveClass("aspect-[3/2]", "object-cover", "max-h-[min(20rem,36vh)]");
  });
});
