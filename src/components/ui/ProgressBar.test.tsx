import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ProgressBar from "./ProgressBar";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: { percent: number }) => {
    if (key === "progressPercent" && params) {
      return `${params.percent}% complete`;
    }
    return key;
  },
}));

describe("ProgressBar Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default props and accessibility attributes", () => {
    render(<ProgressBar value={45} />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "45");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(progressbar).toHaveAttribute("aria-valuetext", "45%");
    expect(progressbar).toHaveAttribute("aria-label", "45% complete");
  });

  it("animates width update using requestAnimationFrame", () => {
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");

    const { unmount } = render(<ProgressBar value={60} />);

    // Initially width state is 0 before animation frame runs
    const innerFill = screen.getByRole("progressbar").firstChild as HTMLElement;
    expect(innerFill).toHaveStyle({ width: "0%" });

    // Trigger requestAnimationFrame callback
    act(() => {
      if (rafCallback) {
        rafCallback(performance.now());
      }
    });

    expect(innerFill).toHaveStyle({ width: "60%" });

    unmount();
    expect(cancelSpy).toHaveBeenCalledWith(1);
  });

  it("clamps values below 0 to 0", () => {
    render(<ProgressBar value={-25} showPercentage label="Underflow" />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    expect(progressbar).toHaveAttribute("aria-valuetext", "0%");

    expect(screen.getByText("Underflow")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("clamps values above 100 to 100", () => {
    render(<ProgressBar value={150} showPercentage label="Overflow" />);

    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    expect(progressbar).toHaveAttribute("aria-valuetext", "100%");

    expect(screen.getByText("Overflow")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders label and percentage when showPercentage is true", () => {
    render(<ProgressBar value={75} label="Loading Progress" showPercentage />);

    expect(screen.getByText("Loading Progress")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-label", "Loading Progress");
  });

  it("renders percentage header when showPercentage is true without a label", () => {
    render(<ProgressBar value={50} showPercentage />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("does not render header bar when neither label nor showPercentage is provided", () => {
    const { container } = render(<ProgressBar value={30} />);

    // Header div should not exist, so top child is the progressbar element
    const headerContainer = container.querySelector(".mb-2.flex");
    expect(headerContainer).toBeNull();
  });

  it("applies correct size classes and custom className", () => {
    const { rerender } = render(<ProgressBar value={20} size="sm" className="custom-class" />);

    let progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("h-2");
    expect(progressbar.parentElement).toHaveClass("custom-class");

    rerender(<ProgressBar value={20} size="md" />);
    progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("h-3");

    rerender(<ProgressBar value={20} size="lg" />);
    progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveClass("h-4");
  });
});
