// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePrintDate } from "./usePrintDate";

describe("usePrintDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats the current date for the locale", () => {
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
});
