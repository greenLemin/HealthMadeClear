// @vitest-environment jsdom
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import SignupForm from "./SignupForm";

const mockSignUp = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function renderSignup() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <SignupForm />
    </NextIntlClientProvider>
  );
}

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders signup form fields", () => {
    renderSignup();
    expect(screen.getByRole("heading", { level: 1, name: en.auth.signupTitle })).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i"))).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i"))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: en.auth.signupButton })).toBeInTheDocument();
  });

  it("validates empty and invalid fields client-side", async () => {
    renderSignup();

    fireEvent.click(screen.getByRole("button", { name: en.auth.signupButton }));

    expect(await screen.findByText(en.auth.emailRequired)).toBeInTheDocument();
    expect(await screen.findByText(en.auth.passwordRequired)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it("maps server 'already registered' error to generic error to prevent email enumeration", async () => {
    mockSignUp.mockResolvedValue({
      data: null,
      error: { message: "User already registered" },
    });

    renderSignup();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.displayNameLabel}`, "i")), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i")), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: en.auth.signupButton }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "existing@example.com",
        password: "Password123!",
        options: {
          data: { display_name: "Test User" },
        },
      });
    });

    // Should show errorGeneric, NOT errorEmailInUse
    expect(await screen.findByRole("alert")).toHaveTextContent(en.auth.errorGeneric);
    expect(screen.queryByText(en.auth.errorEmailInUse)).not.toBeInTheDocument();
  });

  it("shows check email confirmation on successful signup", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    renderSignup();

    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.emailLabel}`, "i")), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(new RegExp(`^${en.auth.passwordLabel}`, "i")), {
      target: { value: "Password123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: en.auth.signupButton }));

    expect(
      await screen.findByRole("heading", { level: 1, name: en.auth.checkEmailTitle })
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
