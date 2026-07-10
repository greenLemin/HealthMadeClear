// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import Footer from "./Footer";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className} data-testid="mock-link">
      {children}
    </a>
  ),
}));

describe("Footer", () => {
  const renderComponent = () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <Footer />
      </NextIntlClientProvider>
    );
  };

  it("renders correctly", () => {
    renderComponent();

    expect(screen.getByText("Health Made Clear")).toBeInTheDocument();

    expect(screen.getByRole("navigation", { name: en.footer.platform })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: en.footer.legal })).toBeInTheDocument();

    expect(screen.getByText(en.disclaimer.educationalLong)).toBeInTheDocument();

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Health Made Clear.`)).toBeInTheDocument();
  });

  it("renders platform links correctly", () => {
    renderComponent();

    const platformNav = screen.getByRole("navigation", { name: en.footer.platform });

    const aboutLink = screen.getByRole("link", { name: en.nav.about });
    expect(aboutLink).toHaveAttribute("href", "/about");
    expect(platformNav).toContainElement(aboutLink);

    const pathsLink = screen.getByRole("link", { name: en.nav.paths });
    expect(pathsLink).toHaveAttribute("href", "/learning-paths");

    // There are multiple "Tools" and "Glossary" texts on the page (e.g. pills vs links),
    // so using getByRole("link", ...) ensures we get the link.
    const toolsLink = screen.getByRole("link", { name: en.nav.tools });
    expect(toolsLink).toHaveAttribute("href", "/tools");

    const glossaryLink = screen.getByRole("link", { name: en.nav.glossary });
    expect(glossaryLink).toHaveAttribute("href", "/glossary");
  });

  it("renders legal links correctly", () => {
    renderComponent();

    const legalNav = screen.getByRole("navigation", { name: en.footer.legal });

    const accessibilityLink = screen.getByRole("link", { name: en.footer.accessibility });
    expect(accessibilityLink).toHaveAttribute("href", "/accessibility");
    expect(legalNav).toContainElement(accessibilityLink);

    const privacyLink = screen.getByRole("link", { name: en.footer.privacy });
    expect(privacyLink).toHaveAttribute("href", "/privacy");

    const termsLink = screen.getByRole("link", { name: en.footer.terms });
    expect(termsLink).toHaveAttribute("href", "/terms");

    const contactLink = screen.getByRole("link", { name: en.footer.contact });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });
});
