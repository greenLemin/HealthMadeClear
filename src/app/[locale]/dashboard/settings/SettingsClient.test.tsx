// @vitest-environment jsdom
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import SettingsClient from "./SettingsClient";
import AppProviders from "@/components/AppProviders";
import { STORAGE_KEYS } from "@/lib/preferences";

const mockRpc = vi.fn();
const mockSignOut = vi.fn();
const mockUpdate = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockPush = vi.fn();
const mockShowToast = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    rpc: mockRpc,
    auth: {
      signOut: mockSignOut,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
    from: () => ({
      update: () => ({
        eq: mockUpdate,
      }),
    }),
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/en/dashboard/settings",
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/ui/ToastProvider", () => ({
  useToast: () => ({ showToast: mockShowToast }),
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/OnboardingDialog", () => ({
  default: () => null,
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/Modal", () => ({
  default: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div role="dialog">{children}</div> : null,
}));

function renderSettings(props = {}) {
  const defaultProps = {
    displayName: "Test User",
    email: "test@example.com",
    memberSince: "2026-01-01",
    locale: "en",
    userId: "user-123",
    ...props,
  };

  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <AppProviders locale="en">
        <SettingsClient {...defaultProps} />
      </AppProviders>
    </NextIntlClientProvider>
  );
}

describe("SettingsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("trims whitespace in displayName before fallback", () => {
    renderSettings({ displayName: "   " });
    expect(screen.getAllByText(en.dashboard.defaultUser).length).toBeGreaterThan(0);
  });

  it("shows deleteFailed toast when rpc('delete_user') returns an error", async () => {
    mockRpc.mockResolvedValue({ error: { message: "RPC error" } });

    renderSettings();

    // Open delete modal
    const deleteBtns = screen.getAllByRole("button", { name: en.settings.deleteAccount });
    fireEvent.click(deleteBtns[0]!);

    // Enter confirmation token
    const confirmInput = screen.getByPlaceholderText(
      en.settings.deleteModalPlaceholder.replace("{token}", en.settings.deleteConfirmToken)
    );
    fireEvent.change(confirmInput, { target: { value: en.settings.deleteConfirmToken } });

    // Click confirm delete button inside modal
    const confirmDeleteBtn = screen.getByRole("button", { name: en.settings.deleteButton });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("delete_user");
    });

    expect(mockShowToast).toHaveBeenCalledWith("error", en.settings.deleteFailed);
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("handles successful delete: calls local signOut, wipes health keys, keeps theme, expires cookies, and redirects", async () => {
    mockRpc.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });

    // Plant health keys, preferences, and auth cookie
    localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(["lesson-1"]));
    localStorage.setItem(STORAGE_KEYS.quizScores, JSON.stringify([{ lessonId: "l1", score: 100 }]));
    localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify({ note: "test" }));
    localStorage.setItem("hmc_guest_completedLessons", JSON.stringify(["guest-1"]));
    localStorage.setItem(STORAGE_KEYS.theme, "dark");
    document.cookie = "sb-projectref-auth-token=jwt-token; path=/";

    renderSettings();

    const deleteBtns = screen.getAllByRole("button", { name: en.settings.deleteAccount });
    fireEvent.click(deleteBtns[0]!);

    const confirmInput = screen.getByPlaceholderText(
      en.settings.deleteModalPlaceholder.replace("{token}", en.settings.deleteConfirmToken)
    );
    fireEvent.change(confirmInput, { target: { value: en.settings.deleteConfirmToken } });

    const confirmDeleteBtn = screen.getByRole("button", { name: en.settings.deleteButton });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("delete_user");
    });

    expect(mockSignOut).toHaveBeenCalledWith({ scope: "local" });
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockShowToast).toHaveBeenCalledWith("info", en.settings.accountDeleted);

    // Health keys wiped
    expect(localStorage.getItem(STORAGE_KEYS.completedLessons)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.quizScores)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.visitPlanner)).toBeNull();
    expect(localStorage.getItem("hmc_guest_completedLessons")).toBeNull();

    // Theme kept
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");

    // Cookie expired
    expect(document.cookie).not.toContain("sb-projectref-auth-token=");
  });

  it("handles rpc success + signOut reject: still wipes health storage, expires cookies, and redirects to '/'", async () => {
    mockRpc.mockResolvedValue({ error: null });
    mockSignOut.mockRejectedValue(new Error("Network timeout"));

    localStorage.setItem(STORAGE_KEYS.completedLessons, JSON.stringify(["lesson-1"]));
    localStorage.setItem("hmc_guest_completedLessons", JSON.stringify(["guest-1"]));
    localStorage.setItem(STORAGE_KEYS.theme, "light");
    document.cookie = "sb-projectref-auth-token=jwt-token; path=/";

    renderSettings();

    const deleteBtns = screen.getAllByRole("button", { name: en.settings.deleteAccount });
    fireEvent.click(deleteBtns[0]!);

    const confirmInput = screen.getByPlaceholderText(
      en.settings.deleteModalPlaceholder.replace("{token}", en.settings.deleteConfirmToken)
    );
    fireEvent.change(confirmInput, { target: { value: en.settings.deleteConfirmToken } });

    const confirmDeleteBtn = screen.getByRole("button", { name: en.settings.deleteButton });
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith("delete_user");
    });

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockShowToast).toHaveBeenCalledWith("info", en.settings.accountDeleted);

    expect(localStorage.getItem(STORAGE_KEYS.completedLessons)).toBeNull();
    expect(localStorage.getItem("hmc_guest_completedLessons")).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("light");
    expect(document.cookie).not.toContain("sb-projectref-auth-token=");
  });
});
