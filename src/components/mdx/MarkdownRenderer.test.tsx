import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("does not render javascript: links", () => {
    const { container } = render(
      <MarkdownRenderer text="[click me](javascript:alert(1))" glossaryTerms={[]} />
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("click me");
  });
});
