// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import StaticPageLoading from "./StaticPageLoading";

vi.mock("@/components/ui/Skeleton", () => ({
  default: ({ variant, width, height, className }: any) => (
    <div
      data-testid={`skeleton-${variant}`}
      data-width={width}
      data-height={height}
      data-classname={className}
    />
  ),
}));

describe("StaticPageLoading", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props", () => {
    render(<StaticPageLoading />);

    const heading = screen.getByTestId("skeleton-heading");
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute("data-width", "min(100%, 14rem)");
    expect(heading).toHaveAttribute("data-classname", "mb-4");

    const text = screen.getByTestId("skeleton-text");
    expect(text).toBeInTheDocument();
    expect(text).toHaveAttribute("data-width", "min(100%, 28rem)");
    expect(text).toHaveAttribute("data-classname", "mb-8");

    const card = screen.getByTestId("skeleton-card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute("data-height", "400px");
    expect(card).toHaveAttribute("data-classname", "max-w-3xl");
  });

  it("applies centered classes when centered is true", () => {
    render(<StaticPageLoading centered />);

    const heading = screen.getByTestId("skeleton-heading");
    expect(heading).toHaveAttribute("data-classname", "mx-auto mb-4");

    const text = screen.getByTestId("skeleton-text");
    expect(text).toHaveAttribute("data-classname", "mx-auto mb-8");

    const card = screen.getByTestId("skeleton-card");
    expect(card).toHaveAttribute("data-classname", "mx-auto max-w-3xl");
  });

  it("renders grid layout when grid prop is provided", () => {
    render(
      <StaticPageLoading
        grid={{
          heroHeight: "300px",
          count: 4,
          itemHeight: "150px",
        }}
      />
    );

    const cards = screen.getAllByTestId("skeleton-card");

    // 1 hero card + 4 grid cards = 5 cards
    expect(cards).toHaveLength(5);

    // Hero card
    expect(cards[0]).toHaveAttribute("data-height", "300px");
    expect(cards[0]).toHaveAttribute("data-classname", "mx-auto mb-8 max-w-3xl");

    // Grid cards
    for (let i = 1; i <= 4; i++) {
      expect(cards[i]).toHaveAttribute("data-height", "150px");
      // Grid cards don't have explicit className passed in the component
      expect(cards[i]).not.toHaveAttribute("data-classname");
    }
  });

  it("respects custom dimension props", () => {
    render(
      <StaticPageLoading
        headingWidth="100px"
        descriptionWidth="200px"
        primaryCardHeight="500px"
        primaryCardClassName="custom-card-class"
      />
    );

    const heading = screen.getByTestId("skeleton-heading");
    expect(heading).toHaveAttribute("data-width", "100px");

    const text = screen.getByTestId("skeleton-text");
    expect(text).toHaveAttribute("data-width", "200px");

    const card = screen.getByTestId("skeleton-card");
    expect(card).toHaveAttribute("data-height", "500px");
    expect(card).toHaveAttribute("data-classname", "custom-card-class");
  });
});
