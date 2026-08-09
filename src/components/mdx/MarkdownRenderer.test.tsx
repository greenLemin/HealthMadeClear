import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";

/**
 * The security property is not "no anchor is rendered" — it is "no anchor is
 * rendered whose href resolves to a scheme the browser will execute". Some
 * payloads get mangled by markdown-it into an ordinary relative path, which is
 * harmless and should still render.
 */
function expectNoExecutableLink(container: HTMLElement) {
  for (const anchor of Array.from(container.querySelectorAll("a"))) {
    const href = anchor.getAttribute("href") ?? "";
    const protocol = new URL(href, "https://example.invalid").protocol;
    expect(["http:", "https:", "mailto:", "tel:"]).toContain(protocol);
  }
}

describe("MarkdownRenderer", () => {
  it("does not render javascript: links", () => {
    const { container } = render(
      <MarkdownRenderer text="[click me](javascript:alert(1))" glossaryTerms={[]} />
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.textContent).toContain("click me");
  });

  it.each([
    ["leading space", "[click me]( javascript:alert(1))"],
    ["leading tab escape", "[click me](\tjavascript:alert(1))"],
    ["percent-encoded leading space", "[click me](%20javascript:alert(1))"],
  ])("does not produce an executable link for %s", (_label, markdown) => {
    const { container } = render(<MarkdownRenderer text={markdown} glossaryTerms={[]} />);
    expectNoExecutableLink(container);
    expect(container.textContent).toContain("click me");
  });

  it.each([
    ["mixed case javascript", "jAvAsCrIpT:alert(1)"],
    ["embedded null byte", "java\u0000script:alert(1)"],
    ["embedded newline", "java\nscript:alert(1)"],
    ["data url", "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="],
    ["vbscript", "vbscript:msgbox(1)"],
    ["file url", "file:///etc/passwd"],
  ])("does not render %s links", (_label, payload) => {
    const { container } = render(<MarkdownRenderer text={`[click me](${payload})`} glossaryTerms={[]} />);
    expectNoExecutableLink(container);
    expect(container.textContent).toContain("click me");
  });

  it.each([
    ["absolute https", "https://example.com/page"],
    ["absolute http", "http://example.com/page"],
    ["mailto", "mailto:hello@example.com"],
    ["tel", "tel:+15551234567"],
    ["site relative", "/en/glossary"],
    ["anchor", "#hypertension"],
  ])("still renders %s links", (_label, href) => {
    const { container } = render(<MarkdownRenderer text={`[click me](${href})`} glossaryTerms={[]} />);
    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("href")).toBe(href);
    expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
