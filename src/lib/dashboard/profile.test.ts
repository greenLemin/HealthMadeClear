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
    expect(consoleSpy).toHaveBeenCalledWith("[dashboard:getUserProfile]", "Not found");
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

    expect(consoleSpy).toHaveBeenCalledWith("[dashboard:getUserProfile:auth]", "Auth failed");

    consoleSpy.mockRestore();
  });
});
