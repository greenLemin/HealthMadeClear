// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import * as motionReact from "motion/react";

vi.mock("motion/react", () => ({
  useReducedMotion: vi.fn(),
}));

describe("useMotionSafe", () => {
  it("returns true when useReducedMotion is true", () => {
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(true);
    const { result } = renderHook(() => useMotionSafe());
    expect(result.current).toBe(true);
  });

  it("returns false when useReducedMotion is false", () => {
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(false);
    const { result } = renderHook(() => useMotionSafe());
    expect(result.current).toBe(false);
  });

  it("returns false when useReducedMotion returns null/undefined", () => {
    vi.mocked(motionReact.useReducedMotion).mockReturnValue(null as any);
    const { result } = renderHook(() => useMotionSafe());
    expect(result.current).toBe(false);
  });
});
