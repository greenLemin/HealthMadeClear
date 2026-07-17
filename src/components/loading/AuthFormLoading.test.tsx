import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AuthFormLoading from "./AuthFormLoading";

vi.mock("@/components/ui/Skeleton", () => ({
  default: ({ variant, width, height, lines, className }: any) => (
    <div
      data-testid="skeleton"
      data-variant={variant}
      data-width={width}
      data-height={height}
      data-lines={lines}
      className={className}
    />
  ),
}));

describe("AuthFormLoading", () => {
  it("renders narrow variant by default with correct default card height", () => {
    const { getAllByTestId } = render(<AuthFormLoading />);
    const skeletons = getAllByTestId("skeleton");

    expect(skeletons).toHaveLength(3);

    // Heading skeleton
    expect(skeletons[0].getAttribute("data-variant")).toBe("heading");
    expect(skeletons[0].getAttribute("data-width")).toBe("240px");

    // Text skeleton
    expect(skeletons[1].getAttribute("data-variant")).toBe("text");
    expect(skeletons[1].getAttribute("data-width")).toBe("100%");

    // Card skeleton
    expect(skeletons[2].getAttribute("data-variant")).toBe("card");
    expect(skeletons[2].getAttribute("data-height")).toBe("280px");
  });

  it("renders compact variant with correct default card height", () => {
    const { getAllByTestId } = render(<AuthFormLoading variant="compact" />);
    const skeletons = getAllByTestId("skeleton");

    expect(skeletons).toHaveLength(1);

    // Card skeleton
    expect(skeletons[0].getAttribute("data-variant")).toBe("card");
    expect(skeletons[0].getAttribute("data-height")).toBe("280px");
  });

  it("renders split variant correctly", () => {
    const { getAllByTestId } = render(<AuthFormLoading variant="split" />);
    const skeletons = getAllByTestId("skeleton");

    expect(skeletons).toHaveLength(4);

    // Heading skeleton
    expect(skeletons[0].getAttribute("data-variant")).toBe("heading");
    expect(skeletons[0].getAttribute("data-width")).toBe("280px");

    // First Text skeleton
    expect(skeletons[1].getAttribute("data-variant")).toBe("text");
    expect(skeletons[1].getAttribute("data-width")).toBe("340px");

    // Second Text skeleton with lines
    expect(skeletons[2].getAttribute("data-variant")).toBe("text");
    expect(skeletons[2].getAttribute("data-lines")).toBe("3");

    // Card skeleton
    expect(skeletons[3].getAttribute("data-variant")).toBe("card");
    expect(skeletons[3].getAttribute("data-height")).toBe("320px");
  });

  it("applies custom cardHeight correctly to narrow variant", () => {
    const { getAllByTestId } = render(<AuthFormLoading cardHeight="400px" />);
    const skeletons = getAllByTestId("skeleton");

    expect(skeletons[2].getAttribute("data-variant")).toBe("card");
    expect(skeletons[2].getAttribute("data-height")).toBe("400px");
  });

  it("applies custom cardHeight correctly to compact variant", () => {
    const { getAllByTestId } = render(<AuthFormLoading variant="compact" cardHeight="500px" />);
    const skeletons = getAllByTestId("skeleton");

    expect(skeletons[0].getAttribute("data-variant")).toBe("card");
    expect(skeletons[0].getAttribute("data-height")).toBe("500px");
  });
});
