// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "./useAuth";
import { AuthContext } from "@/components/providers/AuthProvider";
import React from "react";

// Mock router since AuthProvider imports navigation
vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe("useAuth", () => {
  it("throws an error when used outside of AuthProvider", () => {
    // Suppress console.error for the expected throw
    const originalError = console.error;
    console.error = () => {};

    // In React 18, errors thrown during render also get logged to console.error
    // by jsdom/react internals. We just assert the throw here.
    // Suppress the unhandled runtime error from jsdom as well
    const originalWindowError = window.addEventListener;
    let caughtError: Error | null = null;
    const errorListener = (e: ErrorEvent) => {
      e.preventDefault();
      caughtError = e.error;
    };
    window.addEventListener("error", errorListener);

    try {
      expect(() => renderHook(() => useAuth())).toThrow("useAuth must be used within an AuthProvider");
    } finally {
      console.error = originalError;
      window.removeEventListener("error", errorListener);
    }
  });

  it("returns context when used within AuthProvider", () => {
    const mockContextValue = {
      user: { id: "123" } as any,
      session: { access_token: "abc" } as any,
      loading: false,
      signOut: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockContextValue);
  });
});
