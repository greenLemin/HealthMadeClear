import { describe, expect, it, vi, beforeEach } from "vitest";
import { requireAuth } from "./requireAuth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/i18n/navigation";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  redirect: vi.fn(),
}));

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user when authenticated", async () => {
    const mockUser = { id: "123", email: "test@example.com" };

    // Setup mock client
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });

    const user = await requireAuth("en");

    expect(user).toEqual(mockUser);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to login when not authenticated", async () => {
    // Setup mock client returning null user
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    await requireAuth("es");

    expect(redirect).toHaveBeenCalledWith({ href: "/auth/login", locale: "es" });
  });

  it("includes redirect URL when redirectTo is provided", async () => {
    // Setup mock client returning null user
    (createClient as any).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });

    await requireAuth("en", "/dashboard");

    expect(redirect).toHaveBeenCalledWith({
      href: "/auth/login?redirect=%2Fdashboard",
      locale: "en",
    });
  });
});
