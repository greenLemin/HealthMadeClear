// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { getUserProfile } from "./profile";
import type { SupabaseClient } from "@supabase/supabase-js";

describe("getUserProfile", () => {
  it("should return the user profile with correct display name and email", async () => {
    // We will use a mock SupabaseClient that returns data as expected
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                display_name: "Test User",
                created_at: "2023-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              email: "test@example.com",
            },
          },
          error: null,
        }),
      },
    } as unknown as SupabaseClient;

    const profile = await getUserProfile(mockSupabase, "user123");

    expect(profile).toEqual({
      displayName: "Test User",
      email: "test@example.com",
      createdAt: "2023-01-01T00:00:00Z",
    });

    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
  });

  it("should return null if profile is not found", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Not found" },
            }),
          }),
        }),
      }),
      auth: {
        getUser: vi.fn(),
      },
    } as unknown as SupabaseClient;

    // Supress console error for expected log
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const profile = await getUserProfile(mockSupabase, "user123");

    expect(profile).toBeNull();
    // logQueryError now via reportServerError → [hmc:server] prefix with context
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const [prefix1, , ctx1] = consoleSpy.mock.calls[0] as unknown[] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(prefix1).toBe("[hmc:server]");
    expect(ctx1).toMatchObject({ context: "getUserProfile" });

    expect(mockSupabase.auth.getUser).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should use 'User' fallback if display_name is null", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                display_name: null,
                created_at: "2023-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              email: "test@example.com",
            },
          },
          error: null,
        }),
      },
    } as unknown as SupabaseClient;

    const profile = await getUserProfile(mockSupabase, "user123");

    expect(profile).toEqual({
      displayName: "User",
      email: "test@example.com",
      createdAt: "2023-01-01T00:00:00Z",
    });
  });

  it("should handle auth error gracefully and use empty email fallback", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                display_name: "Test User",
                created_at: "2023-01-01T00:00:00Z",
              },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Auth failed" },
        }),
      },
    } as unknown as SupabaseClient;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const profile = await getUserProfile(mockSupabase, "user123");

    expect(profile).toEqual({
      displayName: "Test User",
      email: "",
      createdAt: "2023-01-01T00:00:00Z",
    });

    // First error is auth, second is profile? Check at least one call with auth context
    expect(consoleSpy).toHaveBeenCalled();
    const authCall = consoleSpy.mock.calls.find((c) => String(c[2]?.context).includes("auth"));
    // reportServerError uses [hmc:server] prefix
    expect(authCall?.[0]).toBe("[hmc:server]");

    consoleSpy.mockRestore();
  });
});
