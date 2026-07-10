// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import DashboardSidebar from "./DashboardSidebar";
import en from "@/messages/en.json";

// Mock the navigation module
vi.mock("@/i18n/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard/progress"),
  Link: ({ children, href, className, "aria-current": ariaCurrent }: any) => (
    <a href={href} className={className} aria-current={ariaCurrent} data-testid={`mock-link-${href}`}>
      {children}
    </a>
  ),
}));

describe("DashboardSidebar", () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      displayName: "John Doe",
      email: "john@example.com",
      streak: 5,
    };

    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DashboardSidebar {...defaultProps} {...props} />
      </NextIntlClientProvider>
    );
  };

  it("renders user information correctly", () => {
    renderComponent();
    expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("john@example.com").length).toBeGreaterThan(0);
    expect(screen.getAllByText("J").length).toBeGreaterThan(0); // Initials
  });

  it("renders streak information correctly", () => {
    renderComponent();
    // In en.json: "streakDays": "{count}-day streak"
    expect(screen.getAllByText("5-day streak").length).toBeGreaterThan(0);
  });

  it("does not render streak if streak is 0 or undefined", () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DashboardSidebar displayName="John Doe" email="john@example.com" />
      </NextIntlClientProvider>
    );
    expect(screen.queryByText(/streak/i)).toBeNull();
  });

  it("identifies active link correctly", () => {
    renderComponent();

    // We mocked usePathname to return "/dashboard/progress"

    // Desktop and mobile links for progress
    const progressLinks = screen.getAllByTestId("mock-link-/dashboard/progress");
    for (const link of progressLinks) {
      expect(link).toHaveAttribute("aria-current", "page");
    }

    // Overview links
    const overviewLinks = screen.getAllByTestId("mock-link-/dashboard");
    for (const link of overviewLinks) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("falls back to default user name when displayName is not provided", () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <DashboardSidebar displayName={undefined as unknown as string} />
      </NextIntlClientProvider>
    );

    expect(screen.getAllByText(en.dashboard.defaultUser || "Learner").length).toBeGreaterThan(0);
  });
});
