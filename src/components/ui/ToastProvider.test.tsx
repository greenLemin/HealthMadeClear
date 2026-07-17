// @vitest-environment jsdom
import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ToastProvider, { useToast } from "./ToastProvider";

const TestComponent = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast("success", "Success Message")}>Show Success</button>
      <button onClick={() => showToast("error", "Error Message")}>Show Error</button>
      <button onClick={() => showToast("info", "Info Message")}>Show Info</button>
    </div>
  );
};

const renderWithProvider = (ui: React.ReactNode) => {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ToastProvider>{ui}</ToastProvider>
    </NextIntlClientProvider>
  );
};

const ComponentOutsideProvider = () => {
  useToast();
  return null;
};

describe("ToastProvider", () => {
  beforeAll(() => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => setTimeout(cb, 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it("throws an error when useToast is used outside of ToastProvider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const errorHandler = (e: ErrorEvent) => e.preventDefault();
    window.addEventListener("error", errorHandler);

    expect(() => render(<ComponentOutsideProvider />)).toThrow("useToast must be used within ToastProvider");

    window.removeEventListener("error", errorHandler);
    consoleError.mockRestore();
  });

  it("renders children correctly", () => {
    renderWithProvider(<div>Test Child Content</div>);
    expect(screen.getByText("Test Child Content")).toBeInTheDocument();
  });

  it("shows a toast when showToast is called", () => {
    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Success"));

    act(() => {
      vi.advanceTimersByTime(10); // for requestAnimationFrame mock
    });

    expect(screen.getByText("Success Message")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows an error toast correctly", () => {
    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Error"));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByText("Error Message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("dismisses a toast when the dismiss button is clicked", () => {
    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Info"));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByText("Info Message")).toBeInTheDocument();

    const dismissButton = screen.getByLabelText(en.common.dismiss);
    fireEvent.click(dismissButton);

    expect(screen.queryByText("Info Message")).not.toBeInTheDocument();
  });

  it("auto-dismisses toast after timer", () => {
    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Success"));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(screen.getByText("Success Message")).toBeInTheDocument();

    // Auto-dismiss is 8000ms + 300ms
    act(() => {
      vi.advanceTimersByTime(8000);
    });

    // Should still be there but invisible (visible=false), actually visible is internal state
    // Then after 300ms it's dismissed
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("Success Message")).not.toBeInTheDocument();
  });

  it("pauses auto-dismiss on hover and resumes on mouse leave", () => {
    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Success"));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const toastElement = screen.getByRole("status");

    // Hover over the toast
    fireEvent.mouseEnter(toastElement);

    // Advance time past the normal dismiss time
    act(() => {
      vi.advanceTimersByTime(8500);
    });

    // Toast should still be visible because timer was paused
    expect(screen.getByText("Success Message")).toBeInTheDocument();

    // Mouse leave to resume timer
    fireEvent.mouseLeave(toastElement);

    // Advance time for the new timer
    act(() => {
      vi.advanceTimersByTime(8300);
    });

    // Toast should be dismissed now
    expect(screen.queryByText("Success Message")).not.toBeInTheDocument();
  });

  it("pauses auto-dismiss on focus and resumes on blur", () => {
    renderWithProvider(<TestComponent />);

    fireEvent.click(screen.getByText("Show Success"));

    act(() => {
      vi.advanceTimersByTime(10);
    });

    const toastElement = screen.getByRole("status");

    // Focus the toast
    fireEvent.focus(toastElement);

    act(() => {
      vi.advanceTimersByTime(8500);
    });

    expect(screen.getByText("Success Message")).toBeInTheDocument();

    // Blur the toast
    fireEvent.blur(toastElement);

    act(() => {
      vi.advanceTimersByTime(8300);
    });

    expect(screen.queryByText("Success Message")).not.toBeInTheDocument();
  });
});
