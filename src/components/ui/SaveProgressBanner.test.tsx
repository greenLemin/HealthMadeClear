import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import SaveProgressBanner from "./SaveProgressBanner";
import * as guestProgressModule from "@/lib/guestProgress";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false })),
}));

describe("SaveProgressBanner", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("does not render when guest has no progress", () => {
    vi.spyOn(guestProgressModule, "getGuestProgress").mockReturnValue({
      completedLessons: [],
      quizAttempts: [],
      bookmarks: [],
    });

    const { container } = render(<SaveProgressBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders when guest has completed lessons", () => {
    vi.spyOn(guestProgressModule, "getGuestProgress").mockReturnValue({
      completedLessons: [{ lessonSlug: "lesson-1", completedAt: "2025-01-01" }],
      quizAttempts: [],
      bookmarks: [],
    });

    render(<SaveProgressBanner />);
    expect(screen.getByText("saveProgressMessage")).toBeInTheDocument();
  });

  it("dismisses banner when close button is clicked", () => {
    vi.spyOn(guestProgressModule, "getGuestProgress").mockReturnValue({
      completedLessons: [{ lessonSlug: "lesson-1", completedAt: "2025-01-01" }],
      quizAttempts: [],
      bookmarks: [],
    });

    render(<SaveProgressBanner />);
    const dismissButton = screen.getByRole("button", { name: "dismissBanner" });
    fireEvent.click(dismissButton);

    expect(screen.queryByText("saveProgressMessage")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("hmc_save_progress_dismissed")).toBe("true");
  });
});
