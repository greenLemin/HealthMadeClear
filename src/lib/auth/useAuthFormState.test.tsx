// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({}) as unknown as SupabaseClient),
}));

import { useAuthFormState } from "./useAuthFormState";

describe("useAuthFormState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty error, no loading, and empty fieldErrors", () => {
    const { result } = renderHook(() => useAuthFormState());
    expect(result.current.error).toBe("");
    expect(result.current.loading).toBe(false);
    expect(result.current.fieldErrors).toEqual({});
  });

  it("setError sets the error message", () => {
    const { result } = renderHook(() => useAuthFormState());
    act(() => result.current.setError("Invalid credentials"));
    expect(result.current.error).toBe("Invalid credentials");
  });

  it("clearError resets the error to empty string", () => {
    const { result } = renderHook(() => useAuthFormState());
    act(() => result.current.setError("Boom"));
    act(() => result.current.clearError());
    expect(result.current.error).toBe("");
  });

  it("setLoading toggles the loading state", () => {
    const { result } = renderHook(() => useAuthFormState());
    act(() => result.current.setLoading(true));
    expect(result.current.loading).toBe(true);
    act(() => result.current.setLoading(false));
    expect(result.current.loading).toBe(false);
  });

  it("setFieldError records a field-specific error", () => {
    const { result } = renderHook(() => useAuthFormState());
    act(() => result.current.setFieldError("email", "Email required"));
    expect(result.current.fieldErrors.email).toBe("Email required");
  });

  it("clearFieldError removes a field-specific error", () => {
    const { result } = renderHook(() => useAuthFormState());
    act(() => result.current.setFieldError("email", "Email required"));
    act(() => result.current.clearFieldError("email"));
    expect(result.current.fieldErrors.email).toBeUndefined();
  });

  it("clearAllErrors resets error and fieldErrors", () => {
    const { result } = renderHook(() => useAuthFormState());
    act(() => {
      result.current.setError("Generic");
      result.current.setFieldError("email", "Email required");
      result.current.setFieldError("password", "Password required");
    });
    act(() => result.current.clearAllErrors());
    expect(result.current.error).toBe("");
    expect(result.current.fieldErrors).toEqual({});
  });

  it("provides a stable supabase client instance", () => {
    const { result, rerender } = renderHook(() => useAuthFormState());
    const first = result.current.supabase;
    rerender();
    expect(result.current.supabase).toBe(first);
  });
});
