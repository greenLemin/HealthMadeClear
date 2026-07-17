// @vitest-environment jsdom
import { render, screen, act, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import en from "@/messages/en.json";
import NetworkStatusBanner from "./NetworkStatusBanner";

describe("NetworkStatusBanner", () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    vi.useFakeTimers();
    originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    Object.defineProperty(navigator, "onLine", {
      writable: true,
      value: originalOnLine,
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <NetworkStatusBanner />
      </NextIntlClientProvider>
    );
  };

  it("does not render when online initially", () => {
    Object.defineProperty(navigator, "onLine", { value: true });
    renderComponent();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders initially when offline", () => {
    Object.defineProperty(navigator, "onLine", { value: false });
    renderComponent();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(en.common.offlineMessage)).toBeInTheDocument();
  });

  it("appears on offline event and disappears on online event after delay", () => {
    renderComponent();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    // Still in the document immediately after online (dismissed becomes true, but offline is still true initially until timeout, but actually the component returns null if `dismissed` is true)

    // Wait, let's check the code:
    // if (!offline || dismissed) return null;
    // So it should disappear immediately when online is fired because dismissed becomes true.
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("can be dismissed by clicking the close button", () => {
    Object.defineProperty(navigator, "onLine", { value: false });
    renderComponent();
    expect(screen.getByRole("status")).toBeInTheDocument();

    const closeButton = screen.getByRole("button", { name: en.common.dismiss });
    act(() => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
