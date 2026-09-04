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
    return render(
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
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("clears pending online timer if offline event fires before 3s timeout", () => {
    renderComponent();

    // Trigger offline
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Trigger online (sets timer for 3000ms)
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    // Advance partially (1000ms)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Trigger offline again before 3000ms finishes
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Advance remaining timer time from first online event (2000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    // Banner should still be visible because offline cleared the pending timer
    expect(screen.getByRole("status")).toBeInTheDocument();
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

  it("cleans up event listeners and pending timer on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderComponent();

    // Trigger online to set timer
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("offline", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("online", expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
