// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { useReadingProgress } from "@/hooks/useReadingProgress";

describe("useReadingProgress", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 1000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 0 when contentRef current is null", () => {
    const contentRef = { current: null };
    const { result } = renderHook(() => useReadingProgress(contentRef));
    expect(result.current).toBe(0);
  });

  it("returns 100 when content height is less than or equal to window innerHeight", () => {
    const mockElement = document.createElement("div");
    vi.spyOn(mockElement, "getBoundingClientRect").mockReturnValue({
      top: 0,
      height: 800,
      bottom: 800,
      left: 0,
      right: 1000,
      width: 1000,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const contentRef = { current: mockElement };
    const { result } = renderHook(() => useReadingProgress(contentRef));

    expect(result.current).toBe(100);
  });

  it("calculates progress correctly based on scroll position", () => {
    const mockElement = document.createElement("div");
    let currentTop = 0;

    vi.spyOn(mockElement, "getBoundingClientRect").mockImplementation(() => ({
      top: currentTop,
      height: 2000, // scrollable = 2000 - 1000 = 1000
      bottom: currentTop + 2000,
      left: 0,
      right: 1000,
      width: 1000,
      x: 0,
      y: currentTop,
      toJSON: () => {},
    }));

    const contentRef = { current: mockElement };
    const { result } = renderHook(() => useReadingProgress(contentRef));

    // At top (top = 0), scrolled = 0, progress = 0%
    expect(result.current).toBe(0);

    // Scroll down 500px (top = -500), scrolled = 500, progress = 50%
    currentTop = -500;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(50);

    // Scroll down 1000px (top = -1000), scrolled = 1000, progress = 100%
    currentTop = -1000;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(100);
  });

  it("clamps progress between 0 and 100 when scrolled beyond bounds", () => {
    const mockElement = document.createElement("div");
    let currentTop = 200; // Above top boundary

    vi.spyOn(mockElement, "getBoundingClientRect").mockImplementation(() => ({
      top: currentTop,
      height: 2000,
      bottom: currentTop + 2000,
      left: 0,
      right: 1000,
      width: 1000,
      x: 0,
      y: currentTop,
      toJSON: () => {},
    }));

    const contentRef = { current: mockElement };
    const { result } = renderHook(() => useReadingProgress(contentRef));

    // Scrolled negative (before start of container) -> clamped to 0
    expect(result.current).toBe(0);

    // Over-scrolled past bottom (top = -1500) -> clamped to 100
    currentTop = -1500;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(100);
  });

  it("updates progress on window resize event", () => {
    const mockElement = document.createElement("div");
    let currentTop = -500;

    vi.spyOn(mockElement, "getBoundingClientRect").mockImplementation(() => ({
      top: currentTop,
      height: 2000,
      bottom: currentTop + 2000,
      left: 0,
      right: 1000,
      width: 1000,
      x: 0,
      y: currentTop,
      toJSON: () => {},
    }));

    const contentRef = { current: mockElement };
    const { result } = renderHook(() => useReadingProgress(contentRef));

    // innerHeight = 1000, height = 2000, scrollable = 1000, scrolled = 500 -> 50%
    expect(result.current).toBe(50);

    // Resize window innerHeight to 1500 -> scrollable = 500, scrolled = 500 -> 100%
    window.innerHeight = 1500;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(100);
  });

  it("removes event listeners on unmount", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const mockElement = document.createElement("div");
    const contentRef = { current: mockElement };

    const { unmount } = renderHook(() => useReadingProgress(contentRef));

    expect(addEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    expect(addEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
