import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import Callout from "./Callout";

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe("Callout Component", () => {
  it("renders with default props (info type)", () => {
    renderWithProvider(<Callout>This is an info callout.</Callout>);
    const callout = screen.getByRole("region");
    expect(callout).toBeInTheDocument();
    expect(callout).toHaveClass("border-primary", "bg-primary-fixed/30");
    expect(callout).toHaveAttribute("aria-label", "Note");
    expect(screen.getByText("This is an info callout.")).toBeInTheDocument();
  });

  it("renders with success type", () => {
    renderWithProvider(<Callout type="success">Success message</Callout>);
    const callout = screen.getByRole("region");
    expect(callout).toHaveClass("border-secondary", "bg-secondary-container/60");
    expect(callout).toHaveAttribute("aria-label", "Tip");
  });

  it("renders with warning type", () => {
    renderWithProvider(<Callout type="warning">Warning message</Callout>);
    const callout = screen.getByRole("region");
    expect(callout).toHaveClass("border-error", "bg-error-container");
    expect(callout).toHaveAttribute("aria-label", "Warning");
  });

  it("renders a title with correct heading level and sr-only label", () => {
    renderWithProvider(<Callout title="Important Note">Content</Callout>);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Note: Important Note");

    const callout = screen.getByRole("region");
    expect(callout).toHaveAttribute("aria-label", "Note: Important Note");
  });

  it("respects headingLevel prop", () => {
    renderWithProvider(
      <Callout title="Sub-note" headingLevel="h3">
        Content
      </Callout>
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithProvider(<Callout className="my-custom-class">Content</Callout>);
    const callout = screen.getByRole("region");
    expect(callout).toHaveClass("my-custom-class");
  });

  it("uses custom typeLabel", () => {
    renderWithProvider(<Callout typeLabel="Custom Label">Content</Callout>);
    const callout = screen.getByRole("region");
    expect(callout).toHaveAttribute("aria-label", "Custom Label");
  });
});
