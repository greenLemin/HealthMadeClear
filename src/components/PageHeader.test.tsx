// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import PageHeader from "./PageHeader";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("PageHeader", () => {
  const renderComponent = (props: any = {}) => {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <PageHeader title="Default Title" {...props} />
      </NextIntlClientProvider>
    );
  };

  it("renders just the title by default", () => {
    renderComponent({ title: "My Page Title" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Page Title");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders a subtitle when provided", () => {
    renderComponent({ subtitle: "My Subtitle" });
    expect(screen.getByText("My Subtitle")).toBeInTheDocument();
  });

  it("renders a badge when provided", () => {
    renderComponent({ badge: "New" });
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    renderComponent({ description: "This is a description" });
    expect(screen.getByText("This is a description")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    renderComponent({ children: <div data-testid="child-element">Child Content</div> });
    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("renders breadcrumbs correctly", () => {
    const breadcrumb = [
      { label: "Home", href: "/" },
      { label: "Category", href: "/category" },
      { label: "Current Page" },
    ];
    renderComponent({ breadcrumb });

    const nav = screen.getByRole("navigation", { name: en.common.breadcrumb });
    expect(nav).toBeInTheDocument();

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Home");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveTextContent("Category");
    expect(links[1]).toHaveAttribute("href", "/category");

    const currentPage = screen.getByText("Current Page");
    expect(currentPage).toBeInTheDocument();
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });
});
