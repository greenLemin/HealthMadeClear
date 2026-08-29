// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import ArticlePageClient from "./ArticlePageClient";
import type { Article } from "@/types/article";

let mockLocale: "en" | "es" = "en";

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({ locale: mockLocale }),
}));

vi.mock("@/components/ui/ToastProvider", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    className,
    ...props
  }: {
    children: ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: ReactNode }) => <div data-reveal="true">{children}</div>,
}));

vi.mock("@/components/mdx/MarkdownRenderer", () => ({
  default: ({ text }: { text: string }) => <div>{text}</div>,
}));

vi.mock("@/components/Callout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => <div>Medical Disclaimer</div>,
}));

const fixtureArticle: Article = {
  id: "understanding-your-eob",
  title: "Understanding Your Explanation of Benefits (EOB)",
  description: "How to read an EOB and match it to provider bills.",
  category: "Insurance & Billing",
  readingTime: "7 min",
  lastReviewed: "2026-06-11",
  reviewedBy: "Health Education Review Team",
  sources: ["CDC", "NIH MedlinePlus"],
  content: {
    sections: [
      {
        title: "What an EOB Is",
        content: "An Explanation of Benefits is not a bill.",
      },
      {
        title: "What an EOB Is",
        content: "The same heading twice must get a unique fragment id.",
      },
      {
        title: "How to Read the Columns",
        content: "Allowed amount is not always what you owe.",
      },
    ],
  },
};

function renderArticle(locale: "en" | "es" = "en") {
  mockLocale = locale;
  const messages = locale === "en" ? en : es;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ArticlePageClient article={fixtureArticle} glossaryTerms={[]} />
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

describe("ArticlePageClient", () => {
  afterEach(() => {
    cleanup();
    mockLocale = "en";
    vi.useRealTimers();
  });

  it("shows sources and reviewedBy, not only lastReviewed", () => {
    renderArticle();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(fixtureArticle.title);
    expect(screen.getAllByText("CDC").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NIH MedlinePlus").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reviewed by Health Education Review Team/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/June 11, 2026/).length).toBeGreaterThan(0);
  });

  it("puts Print in the share row", () => {
    renderArticle();
    const shareCard = screen.getByText(en.articles.share).closest(".surface-card-glass");
    expect(shareCard).not.toBeNull();
    const printInShare = shareCard!.querySelector("button");
    expect(printInShare).toHaveAccessibleName(en.common.print);
    expect(printInShare).toHaveClass("no-print");
    expect(screen.getAllByRole("button", { name: en.common.print }).length).toBeGreaterThan(1);
  });

  it("renders a print-only clinical footer outside Reveal", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    renderArticle();

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

  it("renders the Spanish print-only clinical footer with a locale-aware date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    renderArticle("es");

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

  it("puts article before the TOC aside and does not nest main#main-content", () => {
    renderArticle();

    const article = document.getElementById("article-body");
    const toc = screen.getByRole("complementary", { name: en.articles.onThisPage });
    expect(article).not.toBeNull();
    expect(article!.tagName).toBe("ARTICLE");
    expect(article!.compareDocumentPosition(toc) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(document.querySelectorAll("main#main-content")).toHaveLength(0);
    expect(screen.queryByRole("main")).not.toBeInTheDocument();
  });

  it("wraps article and TOC in a max-w-5xl minmax grid, not max-w-container", () => {
    renderArticle();

    const article = document.getElementById("article-body");
    const grid = article!.parentElement;
    expect(grid).not.toBeNull();
    expect(grid!.className).toMatch(/max-w-5xl/);
    expect(grid!.className).toMatch(/lg:grid-cols-\[minmax\(0,1fr\)_240px\]/);
    expect(grid!.className).not.toMatch(/max-w-container/);
    expect(grid!.className).not.toMatch(/lg:grid-cols-\[1fr_240px\]/);
    expect(article!.className).toMatch(/max-w-prose/);
    expect(article!.className).toMatch(/leading-\[1\.75\]/);

    const toc = screen.getByRole("complementary", { name: en.articles.onThisPage });
    expect(toc.className).toMatch(/\bhidden\b/);
    expect(toc.className).toMatch(/lg:block/);
    expect(toc.className).toMatch(/sticky/);
    expect(toc.className).toMatch(/top-24/);
    expect(toc.className).toMatch(/w-60/);
  });

  it("anchors TOC links to section ids, suffixing duplicate titles with -2", () => {
    renderArticle();

    expect(document.getElementById("what-an-eob-is")).not.toBeNull();
    expect(document.getElementById("what-an-eob-is-2")).not.toBeNull();
    expect(document.getElementById("how-to-read-the-columns")).not.toBeNull();
    expect(document.getElementById("what-an-eob-is")!.className).toMatch(/scroll-mt-24/);
    expect(document.getElementById("what-an-eob-is-2")!.className).toMatch(/scroll-mt-24/);

    const duplicateLinks = screen.getAllByRole("link", { name: "What an EOB Is" });
    expect(duplicateLinks.map((link) => link.getAttribute("href"))).toEqual([
      "#what-an-eob-is",
      "#what-an-eob-is-2",
    ]);
    expect(screen.getByRole("link", { name: "How to Read the Columns" })).toHaveAttribute(
      "href",
      "#how-to-read-the-columns"
    );
  });

  it("renders a reading progress bar at z-[60] with a progressbar role", () => {
    renderArticle();

    const bar = screen.getByRole("progressbar", { name: en.learn.readingProgress });
    expect(bar.className).toMatch(/z-\[60\]/);
    expect(bar.className).toMatch(/h-1\.5/);
    expect(bar.className).toMatch(/bg-primary/);
    expect(bar.className).toMatch(/will-change-\[width\]/);
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});
