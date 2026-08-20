import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Skeleton from "./Skeleton";

describe("Skeleton Component", () => {
  it("renders default text variant with 3 lines when no props are provided", () => {
    const { container } = render(<Skeleton />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute("aria-hidden", "true");

    const lines = wrapper?.children;
    expect(lines).toHaveLength(3);
    if (lines && lines.length === 3) {
      expect((lines[0] as HTMLElement).style.width).toBe("100%");
      expect((lines[0] as HTMLElement).style.height).toBe("1em");
      expect((lines[1] as HTMLElement).style.width).toBe("100%");
      expect((lines[1] as HTMLElement).style.height).toBe("1em");
      expect((lines[2] as HTMLElement).style.width).toBe("60%");
      expect((lines[2] as HTMLElement).style.height).toBe("1em");
    }
  });

  it("renders custom line count for text variant", () => {
    const { container } = render(<Skeleton variant="text" lines={5} />);
    const wrapper = container.firstElementChild;
    const lines = wrapper?.children;
    expect(lines).toHaveLength(5);
  });

  it("renders single line text variant when lines prop is 1", () => {
    const { container } = render(<Skeleton variant="text" lines={1} />);
    const element = container.querySelector("div[aria-hidden='true']") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element.style.width).toBe("100%");
    expect(element.style.height).toBe("1em");
  });

  it("renders non-text variants correctly with default styles", () => {
    const variants = [
      {
        variant: "heading" as const,
        expectedWidth: "75%",
        expectedHeight: "1.5em",
        expectedRounded: "rounded",
      },
      {
        variant: "avatar" as const,
        expectedWidth: "48px",
        expectedHeight: "48px",
        expectedRounded: "rounded-full",
      },
      {
        variant: "card" as const,
        expectedWidth: "100%",
        expectedHeight: "200px",
        expectedRounded: "rounded-2xl",
      },
      {
        variant: "button" as const,
        expectedWidth: "120px",
        expectedHeight: "56px",
        expectedRounded: "rounded-lg",
      },
    ];

    variants.forEach(({ variant, expectedWidth, expectedHeight, expectedRounded }) => {
      const { container, unmount } = render(<Skeleton variant={variant} />);
      const element = container.querySelector("div[aria-hidden='true']") as HTMLElement;
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass(expectedRounded);
      expect(element.style.width).toBe(expectedWidth);
      expect(element.style.height).toBe(expectedHeight);
      unmount();
    });
  });

  it("applies custom width, height, and className props", () => {
    const { container } = render(
      <Skeleton variant="card" width="300px" height="150px" className="custom-skeleton-class" />
    );
    const element = container.querySelector("div[aria-hidden='true']") as HTMLElement;
    expect(element).toBeInTheDocument();
    expect(element).toHaveClass("custom-skeleton-class");
    expect(element.style.width).toBe("300px");
    expect(element.style.height).toBe("150px");
  });

  it("renders accessible loading label when loadingLabel prop is provided", () => {
    render(<Skeleton loadingLabel="Loading user profile..." />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Loading user profile...");
    expect(status).toHaveClass("sr-only");
  });
});
