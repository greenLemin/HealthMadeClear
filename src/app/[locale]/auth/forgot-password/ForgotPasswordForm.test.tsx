// @vitest-environment jsdom
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import ForgotPasswordForm from "./ForgotPasswordForm";

const mockResetPasswordForEmail = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function renderForgotPassword() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ForgotPasswordForm />
    </NextIntlClientProvider>
  );
}

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders forgot password fields", () => {
    renderForgotPassword();
    expect(screen.getByRole("heading", { level: 1, name: en.auth.forgotPasswordTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.auth.sendResetLink })).toBeInTheDocument();
  });

  it("validates empty and invalid email", async () => {
    renderForgotPassword();

    fireEvent.click(screen.getByRole("button", { name: en.auth.sendResetLink }));
    expect(await screen.findByText(en.auth.emailRequired)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.auth.sendResetLink }));
    expect(await screen.findByText(en.auth.errorEmailInvalid)).toBeInTheDocument();
    expect(mockResetPasswordForEmail).not.toHaveBeenCalled();
  });

  it("handles server error by showing generic error alert", async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.auth.sendResetLink }));

    expect(await screen.findByRole("alert")).toHaveTextContent(en.auth.errorGeneric);
  });

  it("renders status container and focuses success heading on success", async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    renderForgotPassword();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "user@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.auth.sendResetLink }));

    const statusContainer = await screen.findByRole("status");
    expect(statusContainer).toBeInTheDocument();

    const successHeading = screen.getByRole("heading", { level: 1, name: en.auth.resetLinkSentTitle });
    expect(successHeading).toBeInTheDocument();

    await waitFor(() => {
      expect(document.activeElement).toBe(successHeading);
    });
  });
});
