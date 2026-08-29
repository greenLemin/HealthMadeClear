// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import GlossaryClient from "./GlossaryClient";
import type { GlossaryTerm } from "@/types/glossary";

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
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/mdx/MarkdownRenderer", () => ({
  default: ({ text }: { text: string }) => <div>{text}</div>,
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => <div>Medical Disclaimer</div>,
}));

const fixtureTerms: GlossaryTerm[] = [
  {
    id: "aspirin",
    term: "Aspirin",
    definition: "A common pain reliever.",
    category: "Medication",
    relatedLessons: ["pain-medications-safely"],
  },
];

const lessonTitles = {
  "pain-medications-safely": "Using Pain Medications Safely",
};

describe("GlossaryClient", () => {
  const renderComponent = () =>
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <GlossaryClient
          terms={fixtureTerms}
          lessonTitles={lessonTitles}
          termLabels={{ aspirin: "Aspirin" }}
        />
      </NextIntlClientProvider>
    );

  it("renders letter buttons as 44px snap chips in a non-wrapping mobile row", () => {
    renderComponent();

    const letterA = screen.getByRole("button", { name: "A" });
    expect(letterA.className).toContain("snap-center");
    expect(letterA.className).toContain("h-11");
    expect(letterA.className).toContain("min-h-11");
    expect(letterA.className).toContain("min-w-11");
    expect(letterA.className).toContain("shrink-0");
    expect(letterA.className).toContain("px-3");
    expect(letterA.className).toContain("py-2");

    const row = letterA.parentElement;
    expect(row).not.toBeNull();
    expect(row!.className).toContain("flex-nowrap");
    expect(row!.className).toContain("overflow-x-auto");
    expect(row!.className).toContain("snap-x");
    expect(row!.className).toContain("snap-proximity");
    expect(row!.className).not.toContain("snap-mandatory");
    expect(row!.className).toContain("scrollbar-none");
    expect(row!.className).toContain("[-webkit-mask-image:");
    expect(row!.className).toContain("[mask-image:");
  });

  it("gives related-lesson links a 44px min height", () => {
    renderComponent();

    const lessonLink = screen.getByRole("link", { name: "Using Pain Medications Safely" });
    expect(lessonLink).toHaveAttribute("href", "/learn/pain-medications-safely");
    expect(lessonLink.className).toContain("min-h-11");
    expect(lessonLink.className).toContain("inline-flex");
  });
});
