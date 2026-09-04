// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPrintDate, usePrintDate } from "./usePrintDate";

describe("formatPrintDate", () => {
  it("formats date in es-ES when locale is 'es'", () => {
    const testDate = new Date("2026-08-28T15:00:00");
    const formatted = formatPrintDate("es", testDate);
    expect(formatted).toBe(
      testDate.toLocaleDateString("es-ES", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  });

  it("formats date in en-US when locale is non-es", () => {
    const testDate = new Date("2026-08-28T15:00:00");
    const formatted = formatPrintDate("en", testDate);
    expect(formatted).toBe(
      testDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  });

  it("uses the current date when date argument is omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    const formatted = formatPrintDate("en");
    expect(formatted).toBe(
      new Date("2026-08-28T15:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
    vi.useRealTimers();
  });
});

describe("usePrintDate", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("formats the current date for the english locale", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    const { result } = renderHook(() => usePrintDate("en"));
    expect(result.current).toBe(
      new Date("2026-08-28T15:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  });

  it("formats the current date for spanish locale", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    const { result } = renderHook(() => usePrintDate("es"));
    expect(result.current).toBe(
      new Date("2026-08-28T15:00:00").toLocaleDateString("es-ES", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  });

  it("refreshes when beforeprint fires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    const { result } = renderHook(() => usePrintDate("en"));

    vi.setSystemTime(new Date("2026-08-29T15:00:00"));
    act(() => {
      window.dispatchEvent(new Event("beforeprint"));
    });

    expect(result.current).toBe(
      new Date("2026-08-29T15:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  });

  it("updates print date when locale prop changes", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-28T15:00:00"));
    const { result, rerender } = renderHook(({ locale }) => usePrintDate(locale), {
      initialProps: { locale: "en" },
    });

    expect(result.current).toBe(
      new Date("2026-08-28T15:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );

    rerender({ locale: "es" });

    expect(result.current).toBe(
      new Date("2026-08-28T15:00:00").toLocaleDateString("es-ES", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
  });

  it("removes event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => usePrintDate("en"));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeprint", expect.any(Function));
  });
});
