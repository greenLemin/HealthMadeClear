// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import LocaleNotFound from "./not-found";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("LocaleNotFound", () => {
  it("renders padded home and learn links plus the search hint", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <LocaleNotFound />
      </NextIntlClientProvider>
    );

    const home = screen.getByRole("link", { name: en.errors.goHome });
    expect(home).toHaveAttribute("href", "/");
    expect(home.className).toContain("min-h-12");

    const learn = screen.getByRole("link", { name: en.nav.learn });
    expect(learn).toHaveAttribute("href", "/learn");
    expect(learn.className).toContain("min-h-12");

    expect(screen.getByText(en.errors.searchHint)).toBeInTheDocument();
  });
});
