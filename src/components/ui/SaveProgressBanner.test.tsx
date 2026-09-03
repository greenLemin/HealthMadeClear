// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import en from "@/messages/en.json";
import SaveProgressBanner from "./SaveProgressBanner";
import * as guestProgress from "@/lib/guestProgress";
import { useAuth } from "@/hooks/useAuth";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("SaveProgressBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <SaveProgressBanner />
      </NextIntlClientProvider>
    );
  };

  it("does not render when auth is loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signOut: vi.fn(),
    } as any);

    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();
    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("does not render when user is logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123", email: "test@example.com" } as any,
      loading: false,
      signOut: vi.fn(),
    } as any);

    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();
    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("does not render when guest has no progress", () => {
    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: [],
      quizAttempts: [],
    });

    renderComponent();
    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("renders when guest has completed lessons", () => {
    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();
    expect(screen.getByText(en.auth.saveProgressMessage)).toBeInTheDocument();
    expect(screen.getByText(en.auth.createAccountCta)).toBeInTheDocument();
  });

  it("renders when guest has quiz attempts", () => {
    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: [],
      quizAttempts: [{ quizId: "quiz-1", score: 5, maxScore: 5 }],
    });

    renderComponent();
    expect(screen.getByText(en.auth.saveProgressMessage)).toBeInTheDocument();
  });

  it("does not render if banner was previously dismissed in sessionStorage", () => {
    sessionStorage.setItem("hmc_save_progress_dismissed", "true");
    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();
    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("handles exception thrown by sessionStorage.getItem gracefully", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
      throw new Error("SecurityError: Access denied");
    });

    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    expect(() => renderComponent()).not.toThrow();
    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("dismisses the banner when dismiss button is clicked and stores state in sessionStorage", () => {
    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();
    const dismissBtn = screen.getByRole("button", { name: en.auth.dismissBanner });
    fireEvent.click(dismissBtn);

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
    expect(sessionStorage.getItem("hmc_save_progress_dismissed")).toBe("true");
  });

  it("handles exception thrown by sessionStorage.setItem when dismissing gracefully", () => {
    vi.spyOn(guestProgress, "getGuestProgress").mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();
    vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    const dismissBtn = screen.getByRole("button", { name: en.auth.dismissBanner });
    expect(() => fireEvent.click(dismissBtn)).not.toThrow();
    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });
});
