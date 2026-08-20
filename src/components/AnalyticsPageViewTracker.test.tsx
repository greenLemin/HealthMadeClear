// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import AnalyticsPageViewTracker from "./AnalyticsPageViewTracker";
import { trackPageView } from "@/lib/analytics";

let mockPathname = "/initial-path";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/lib/analytics", () => ({
  trackPageView: vi.fn(),
}));

describe("AnalyticsPageViewTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/initial-path";
    window.history.pushState({}, "", "/initial-path");
  });

  it("does not call trackPageView on initial render due to first render ref guard", () => {
    render(<AnalyticsPageViewTracker locale="en" />);
    expect(trackPageView).not.toHaveBeenCalled();
  });

  it("calls trackPageView on subsequent renders when pathname changes", () => {
    const { rerender } = render(<AnalyticsPageViewTracker locale="en" />);
    expect(trackPageView).not.toHaveBeenCalled();

    mockPathname = "/new-path?ref=test";
    window.history.pushState({}, "", "/new-path?ref=test");
    rerender(<AnalyticsPageViewTracker locale="en" />);

    expect(trackPageView).toHaveBeenCalledTimes(1);
    expect(trackPageView).toHaveBeenCalledWith("/new-path?ref=test", "en");
  });

  it("calls trackPageView when locale changes", () => {
    const { rerender } = render(<AnalyticsPageViewTracker locale="en" />);
    expect(trackPageView).not.toHaveBeenCalled();

    rerender(<AnalyticsPageViewTracker locale="es" />);

    expect(trackPageView).toHaveBeenCalledTimes(1);
    expect(trackPageView).toHaveBeenCalledWith("/initial-path", "es");
  });

  it("does not call trackPageView if pathname and locale remain unchanged", () => {
    const { rerender } = render(<AnalyticsPageViewTracker locale="en" />);
    expect(trackPageView).not.toHaveBeenCalled();

    rerender(<AnalyticsPageViewTracker locale="en" />);

    expect(trackPageView).not.toHaveBeenCalled();
  });

  it("renders null to DOM", () => {
    const { container } = render(<AnalyticsPageViewTracker locale="en" />);
    expect(container.firstChild).toBeNull();
  });
});
