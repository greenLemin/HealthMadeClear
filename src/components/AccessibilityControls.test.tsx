// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi } from "vitest";
import en from "@/messages/en.json";
import AccessibilityControls from "./AccessibilityControls";
import { useAppState } from "@/components/AppProviders";
import { useMotionSafe } from "@/hooks/useMotionSafe";

vi.mock("motion/react", () => {
  const MockMotionDiv = React.forwardRef(({ children, ...props }: any, ref: any) => {
    // Omit framer-motion specific props that shouldn't be forwarded to DOM
    const { initial, animate, exit, variants, transition, ...rest } = props;
    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    );
  });
  MockMotionDiv.displayName = "MockMotionDiv";

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: MockMotionDiv,
    },
  };
});

vi.mock("@/components/AppProviders", () => ({
  useAppState: vi.fn(),
}));

vi.mock("@/hooks/useMotionSafe", () => ({
  useMotionSafe: vi.fn(),
}));

describe("AccessibilityControls", () => {
  const mockSetTextSize = vi.fn();
  const mockSetTheme = vi.fn();
  const mockSetSimpleMode = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMotionSafe).mockReturnValue(false);

    vi.mocked(useAppState).mockReturnValue({
      textSize: "standard",
      setTextSize: mockSetTextSize,
      theme: "light",
      setTheme: mockSetTheme,
      simpleMode: false,
      setSimpleMode: mockSetSimpleMode,
    } as any);
  });

  const renderComponent = () =>
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AccessibilityControls />
      </NextIntlClientProvider>
    );

  const getToggleButton = () => screen.getByRole("button", { name: /display/i });

  it("renders collapsed toggle button initially", () => {
    renderComponent();
    const toggleBtn = getToggleButton();
    expect(toggleBtn).toBeInTheDocument();
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exposes Display as a single accessible name", () => {
    renderComponent();
    expect(screen.getAllByRole("button", { name: en.accessibility.display })).toHaveLength(1);
    expect(screen.getAllByText(en.accessibility.display)).toHaveLength(1);
  });

  it("opens and closes panel on toggle button click", () => {
    renderComponent();
    const toggleBtn = getToggleButton();

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes panel on dismiss button click", () => {
    renderComponent();
    const toggleBtn = getToggleButton();
    fireEvent.click(toggleBtn);

    const dismissBtn = screen.getByRole("button", { name: en.common.dismiss });
    fireEvent.click(dismissBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles panel open/closed via Shift+A global keydown", () => {
    renderComponent();

    act(() => {
      fireEvent.keyDown(document, { key: "A", shiftKey: true });
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(document, { key: "a", shiftKey: true });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not toggle panel when Shift is not pressed with A", () => {
    renderComponent();

    act(() => {
      fireEvent.keyDown(document, { key: "A", shiftKey: false });
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders text size controls and calls setTextSize on click", () => {
    renderComponent();
    fireEvent.click(getToggleButton());

    const standardRadio = screen.getByRole("radio", { name: en.accessibility.textSizeStandard });
    const largeRadio = screen.getByRole("radio", { name: en.accessibility.textSizeLarge });
    const largestRadio = screen.getByRole("radio", { name: en.accessibility.textSizeLargest });

    expect(standardRadio).toHaveAttribute("aria-checked", "true");
    expect(largeRadio).toHaveAttribute("aria-checked", "false");
    expect(largestRadio).toHaveAttribute("aria-checked", "false");

    fireEvent.click(largeRadio);
    expect(mockSetTextSize).toHaveBeenCalledWith("large");
  });

  it("navigates text size radio group using arrow keys", () => {
    renderComponent();
    fireEvent.click(getToggleButton());

    const standardRadio = screen.getByRole("radio", { name: en.accessibility.textSizeStandard });

    // Press ArrowRight from 'standard' (index 0) -> expect 'large' (index 1)
    fireEvent.keyDown(standardRadio, { key: "ArrowRight" });
    expect(mockSetTextSize).toHaveBeenCalledWith("large");

    // Press ArrowLeft from 'standard' (index 0) -> expect 'largest' (index 2 circular)
    fireEvent.keyDown(standardRadio, { key: "ArrowLeft" });
    expect(mockSetTextSize).toHaveBeenCalledWith("largest");

    // Press ArrowDown from 'standard' -> expect 'large'
    fireEvent.keyDown(standardRadio, { key: "ArrowDown" });
    expect(mockSetTextSize).toHaveBeenCalledWith("large");

    // Press ArrowUp from 'standard' -> expect 'largest'
    fireEvent.keyDown(standardRadio, { key: "ArrowUp" });
    expect(mockSetTextSize).toHaveBeenCalledWith("largest");

    // Press ignored key
    mockSetTextSize.mockClear();
    fireEvent.keyDown(standardRadio, { key: "Enter" });
    expect(mockSetTextSize).not.toHaveBeenCalled();
  });

  it("renders theme controls and calls setTheme on click and arrow navigation", () => {
    renderComponent();
    fireEvent.click(getToggleButton());

    const lightRadio = screen.getByRole("radio", { name: en.accessibility.light });
    const darkRadio = screen.getByRole("radio", { name: en.accessibility.dark });

    expect(lightRadio).toHaveAttribute("aria-checked", "true");
    expect(darkRadio).toHaveAttribute("aria-checked", "false");

    fireEvent.click(darkRadio);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");

    fireEvent.keyDown(lightRadio, { key: "ArrowRight" });
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("renders simple mode control and calls setSimpleMode on click", () => {
    renderComponent();
    fireEvent.click(getToggleButton());

    const simpleModeBtn = screen.getByRole("button", {
      name: `${en.accessibility.simpleMode}, ${en.accessibility.off}`,
    });

    expect(simpleModeBtn).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(simpleModeBtn);
    expect(mockSetSimpleMode).toHaveBeenCalledWith(true);
  });

  it("renders correctly when motionSafe is true", () => {
    vi.mocked(useMotionSafe).mockReturnValue(true);
    renderComponent();

    fireEvent.click(getToggleButton());

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
