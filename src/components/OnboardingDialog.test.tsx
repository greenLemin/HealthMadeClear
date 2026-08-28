// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingDialog from "./OnboardingDialog";
import { usePathname } from "@/i18n/navigation";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";

vi.mock("@/i18n/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock("@/hooks/useDismissibleOverlay", () => ({
  useDismissibleOverlay: vi.fn(),
}));

vi.mock("@/hooks/useFocusTrap", () => ({
  useFocusTrap: vi.fn(),
}));

vi.mock("@/hooks/useMotionSafe", () => ({
  useMotionSafe: vi.fn(() => false),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

vi.mock("@/components/ui/animation", () => ({ revealEase: "ease" }));

describe("OnboardingDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders onboarding dialog on home page when not previously onboarded", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<OnboardingDialog />);
    expect(screen.getByRole("heading", { name: "title" })).toBeInTheDocument();
  });

  it("does not render onboarding dialog when not on home page", () => {
    vi.mocked(usePathname).mockReturnValue("/about");
    render(<OnboardingDialog />);
    expect(screen.queryByRole("heading", { name: "title" })).not.toBeInTheDocument();
  });

  it("does not render onboarding dialog when already onboarded in localStorage", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    localStorage.setItem("hmc_onboarded", "true");
    render(<OnboardingDialog />);
    expect(screen.queryByRole("heading", { name: "title" })).not.toBeInTheDocument();
  });

  it("dismisses onboarding dialog when getStarted button is clicked", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<OnboardingDialog />);
    const button = screen.getByText("getStarted");
    fireEvent.click(button);
    expect(localStorage.getItem("hmc_onboarded")).toBe("true");
    expect(screen.queryByRole("heading", { name: "title" })).not.toBeInTheDocument();
  });

  it("locks body scroll while the overlay is open", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<OnboardingDialog />);
    expect(useDismissibleOverlay).toHaveBeenCalledWith(expect.objectContaining({ lockBodyScroll: true }));
  });
});
