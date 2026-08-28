// @vitest-environment jsdom
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import LoginForm from "./LoginForm";

const mockSignInWithPassword = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/guestProgress", () => ({
  migrateGuestProgressToSupabase: vi.fn().mockResolvedValue({ ok: true, errors: [] }),
}));

function renderLogin() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <LoginForm />
    </NextIntlClientProvider>
  );
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders login fields", () => {
    renderLogin();
    expect(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i"))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.auth.loginButton })).toBeInTheDocument();
  });

  it("displays URL error alerts when ?error= param is present", () => {
    mockSearchParams = new URLSearchParams("error=confirmation_failed");
    renderLogin();
    expect(screen.getByRole("alert")).toHaveTextContent(en.auth.errorConfirmationFailed);
  });

  it("validates empty email and password", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    expect(await screen.findByText(en.auth.emailRequired)).toBeInTheDocument();
    expect(await screen.findByText(en.auth.passwordRequired)).toBeInTheDocument();
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("shows invalid credentials on signIn error", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i")), {
      target: { value: "WrongPassword123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.auth.errorInvalidCredentials);
  });

  it("sanitizes redirect param and navigates to safe route on successful login", async () => {
    mockSearchParams = new URLSearchParams("redirect=%2Fen%2Fdashboard");
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i")), {
      target: { value: "CorrectPassword123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/en/dashboard");
    });
  });

  it("sanitizes malicious external redirect URL to default path", async () => {
    mockSearchParams = new URLSearchParams("redirect=https%3A%2F%2Fevil.com");
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i")), {
      target: { value: "CorrectPassword123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: en.auth.loginButton }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });
});
