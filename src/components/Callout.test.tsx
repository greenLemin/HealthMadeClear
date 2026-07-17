import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Callout from "./Callout";

describe("Callout Component", () => {
  it("renders with default props (info type)", () => {
    render(<Callout>This is an info callout.</Callout>);
    const callout = screen.getByRole("note");
    expect(callout).toBeInTheDocument();
    expect(callout).toHaveClass("border-primary", "bg-primary-fixed/30");
    expect(callout).toHaveAttribute("aria-label", "Note");
    expect(screen.getByText("This is an info callout.")).toBeInTheDocument();
  });

  it("renders with success type", () => {
    render(<Callout type="success">Success message</Callout>);
    const callout = screen.getByRole("note");
    expect(callout).toHaveClass("border-secondary", "bg-secondary-container/60");
    expect(callout).toHaveAttribute("aria-label", "Tip");
  });

  it("renders with warning type", () => {
    render(<Callout type="warning">Warning message</Callout>);
    const callout = screen.getByRole("note");
    expect(callout).toHaveClass("border-error", "bg-error-container");
    expect(callout).toHaveAttribute("aria-label", "Warning");
  });

  it("renders a title with correct heading level and sr-only label", () => {
    render(<Callout title="Important Note">Content</Callout>);

    // Default heading level is h2
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Note: Important Note");

    // When title is provided, aria-label is undefined on the container
    const callout = screen.getByRole("note");
    expect(callout).not.toHaveAttribute("aria-label");
  });

  it("respects headingLevel prop", () => {
    render(
      <Callout title="Sub-note" headingLevel="h3">
        Content
      </Callout>
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Callout className="my-custom-class">Content</Callout>);
    const callout = screen.getByRole("note");
    expect(callout).toHaveClass("my-custom-class");
  });

  it("uses custom typeLabel", () => {
    render(<Callout typeLabel="Custom Label">Content</Callout>);
    const callout = screen.getByRole("note");
    expect(callout).toHaveAttribute("aria-label", "Custom Label");
  });
});
