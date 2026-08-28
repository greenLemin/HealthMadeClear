// @vitest-environment jsdom
import { StrictMode } from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ResetPasswordClient from "./ResetPasswordClient";

const { mockAuth, mockSupabase } = vi.hoisted(() => ({
  mockAuth: {
    user: null as { id: string } | null,
    session: null as null,
    loading: false,
    signOut: async () => {},
  },
  mockSupabase: {
    auth: {
      exchangeCodeForSession: vi.fn(),
      verifyOtp: vi.fn(),
      updateUser: vi.fn(),
    },
  },
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabase,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function renderReset() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ResetPasswordClient />
    </NextIntlClientProvider>
  );
}

function setWindowUrl(url: string) {
  window.history.replaceState({}, "", url);
}

describe("ResetPasswordClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.user = null;
    mockAuth.loading = false;
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    mockSupabase.auth.verifyOtp.mockResolvedValue({ error: null });
    setWindowUrl("/en/auth/reset-password");
  });

  afterEach(() => {
    cleanup();
    setWindowUrl("/en/auth/reset-password");
  });

  it("exchanges ?code= and strips it from the URL", async () => {
    setWindowUrl("/en/auth/reset-password?code=abc");
    renderReset();

    await waitFor(() => {
      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    });
    expect(window.location.search).not.toContain("code");
  });

  it("calls exchangeCodeForSession only once under StrictMode", async () => {
    setWindowUrl("/en/auth/reset-password?code=abc");
    render(
      <StrictMode>
        <NextIntlClientProvider locale="en" messages={en}>
          <ResetPasswordClient />
        </NextIntlClientProvider>
      </StrictMode>
    );

    await waitFor(() => {
      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledTimes(1);
    });
    expect(window.location.search).not.toContain("code");
  });

  it("exchanges a hash-only #code=", async () => {
    setWindowUrl("/en/auth/reset-password#code=xyz");
    renderReset();

    await waitFor(() => {
      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("xyz");
    });
  });

  it("shows the form and skips exchange when a session already exists", async () => {
    mockAuth.user = { id: "user-1" };
    mockAuth.loading = false;
    renderReset();

    expect(await screen.findByRole("heading", { level: 1, name: en.auth.resetPasswordTitle })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
    expect(mockSupabase.auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("does not show invalid-link while auth is still loading", () => {
    mockAuth.loading = true;
    renderReset();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("shows invalid-link when auth is loaded and there is no session", async () => {
    mockAuth.user = null;
    mockAuth.loading = false;
    renderReset();

    expect(await screen.findByRole("alert")).toHaveTextContent(en.auth.errorInvalidResetLink);
    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("calls verifyOtp for token_hash + type=recovery", async () => {
    setWindowUrl("/en/auth/reset-password?token_hash=th&type=recovery");
    renderReset();

    await waitFor(() => {
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "th", type: "recovery" });
    });
    expect(mockSupabase.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("still shows the form when exchange fails but a session already exists", async () => {
    mockAuth.user = { id: "user-1" };
    mockAuth.loading = false;
    mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: { message: "already used" } });
    setWindowUrl("/en/auth/reset-password?code=abc");
    renderReset();

    await waitFor(() => {
      expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    });
    expect(screen.getByRole("heading", { level: 1, name: en.auth.resetPasswordTitle })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows generic error when verifyOtp throws and there is no session", async () => {
    mockSupabase.auth.verifyOtp.mockImplementation(() => {
      throw new Error("verifyOtp is not a function");
    });
    setWindowUrl("/en/auth/reset-password?token_hash=th&type=recovery");
    renderReset();

    expect(await screen.findByRole("alert")).toHaveTextContent(en.auth.errorGeneric);
    expect(window.location.search).not.toContain("token_hash");
  });

  it("shows generic error when exchangeCodeForSession rejects and there is no session", async () => {
    mockSupabase.auth.exchangeCodeForSession.mockRejectedValue(new Error("network"));
    setWindowUrl("/en/auth/reset-password?code=abc");
    renderReset();

    expect(await screen.findByRole("alert")).toHaveTextContent(en.auth.errorGeneric);
  });

  it("still shows the form when verifyOtp throws but a session already exists", async () => {
    mockAuth.user = { id: "user-1" };
    mockAuth.loading = false;
    mockSupabase.auth.verifyOtp.mockImplementation(() => {
      throw new Error("verifyOtp is not a function");
    });
    setWindowUrl("/en/auth/reset-password?token_hash=th&type=recovery");
    renderReset();

    await waitFor(() => {
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalled();
    });
    expect(screen.getByRole("heading", { level: 1, name: en.auth.resetPasswordTitle })).toBeVisible();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
