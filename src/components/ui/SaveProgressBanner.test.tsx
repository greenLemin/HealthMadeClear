// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import en from "@/messages/en.json";
import SaveProgressBanner from "./SaveProgressBanner";
import { useAuth } from "@/hooks/useAuth";
import { getGuestProgress } from "@/lib/guestProgress";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/guestProgress", () => ({
  getGuestProgress: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  ),
}));

describe("SaveProgressBanner", () => {
  const BANNER_DISMISSED_KEY = "hmc_save_progress_dismissed";

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
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
      session: null,
      loading: true,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("does not render when user is logged in", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123" } as any,
      session: { access_token: "token" } as any,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("does not render when guest has no progress", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("does not render if banner was previously dismissed in sessionStorage", () => {
    sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
  });

  it("renders when guest user has completed lessons", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.getByText(en.auth.saveProgressMessage)).toBeInTheDocument();
    const createAccountBtn = screen.getByRole("link", { name: en.auth.createAccountCta });
    expect(createAccountBtn).toHaveAttribute("href", "/auth/signup");
  });

  it("renders when guest user has quiz attempts", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: [],
      quizAttempts: [{ quizId: "quiz-1", score: 80, maxScore: 100 }],
    });

    renderComponent();

    expect(screen.getByText(en.auth.saveProgressMessage)).toBeInTheDocument();
  });

  it("dismisses the banner when dismiss button is clicked and stores dismissed flag in sessionStorage", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.getByText(en.auth.saveProgressMessage)).toBeInTheDocument();

    const dismissButton = screen.getByRole("button", { name: en.auth.dismissBanner });
    fireEvent.click(dismissButton);

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
    expect(sessionStorage.getItem(BANNER_DISMISSED_KEY)).toBe("true");
  });

  it("handles sessionStorage.getItem throwing an error (e.g., restricted access)", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementationOnce(() => {
      throw new Error("SecurityError: Access is denied");
    });

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
    getItemSpy.mockRestore();
  });

  it("handles sessionStorage.setItem throwing an error when dismissing", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
    vi.mocked(getGuestProgress).mockReturnValue({
      completedLessons: ["lesson-1"],
      quizAttempts: [],
    });

    renderComponent();

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });

    const dismissButton = screen.getByRole("button", { name: en.auth.dismissBanner });
    expect(() => fireEvent.click(dismissButton)).not.toThrow();

    expect(screen.queryByText(en.auth.saveProgressMessage)).not.toBeInTheDocument();
    setItemSpy.mockRestore();
  });
});
