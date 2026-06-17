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
  it("does not render javascript: links with leading whitespace", () => {
    const { container: container1 } = render(
      <MarkdownRenderer text="[click me]( javascript:alert(1))" glossaryTerms={[]} />
    );
    expect(container1.querySelector("a")).toBeNull();
    expect(container1.textContent).toContain("click me");

    const { container: container2 } = render(
      <MarkdownRenderer text="[click me](\tjavascript:alert(1))" glossaryTerms={[]} />
    );
    expect(container2.querySelector("a")).toBeNull();
    expect(container2.textContent).toContain("click me");

    const { container: container3 } = render(
      <MarkdownRenderer text="[click me](%20javascript:alert(1))" glossaryTerms={[]} />
    );
    expect(container3.querySelector("a")).toBeNull();
    expect(container3.textContent).toContain("click me");
  });
});
