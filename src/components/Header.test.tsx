// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace: string) => (key: string) => `${namespace}.${key}`),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: null, loading: false, signOut: vi.fn() })),
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

vi.mock("@/components/AccessibilityControls", () => ({
  default: () => <div data-testid="a11y-controls" />,
}));

vi.mock("@/components/LanguageToggle", () => ({
  default: () => <div data-testid="lang-toggle" />,
}));

vi.mock("@/components/Logo", () => ({
  default: ({ className }: { className?: string }) => <div data-testid="logo" className={className} />,
}));

vi.mock("@/components/SearchDialog", () => ({
  default: () => <div data-testid="search" />,
}));

vi.mock("@/components/header/MobileMenu", () => ({
  default: () => <div data-testid="mobile-menu" />,
}));

vi.mock("@/components/header/NavLink", () => ({
  default: ({ label }: { label: string }) => <a href="#">{label}</a>,
}));

vi.mock("@/components/ui/ButtonLink", () => ({
  default: ({
    children,
    href,
    className,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode;
    href?: string;
    className?: string;
    "aria-label"?: string;
  }) => (
    <a href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/Skeleton", () => ({
  default: () => <div data-testid="skeleton" />,
}));

vi.mock("@/components/ui/ThemeToggle", () => ({
  default: () => <div data-testid="theme-toggle" />,
}));

vi.mock("@/components/ui/TruncatedText", () => ({
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/ui/NotificationCenter", () => ({
  default: () => <div data-testid="notif-center" />,
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      className,
      id,
      role,
      ...rest
    }: {
      children: React.ReactNode;
      className?: string;
      id?: string;
      role?: string;
      [key: string]: unknown;
    }) => {
      const { initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...dom } = rest;
      return (
        <div className={className} id={id} role={role} {...dom}>
          {children}
        </div>
      );
    },
  },
}));

vi.mock("@/components/ui/animation", () => ({ revealEase: "ease" }));

import Header from "./Header";
import { useAuth } from "@/hooks/useAuth";

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signOut: vi.fn(),
    });
  });

  it("renders the skip link pointing to #main-content", () => {
    render(<Header />);
    expect(screen.getByText("nav.skipToContent")).toHaveAttribute("href", "#main-content");
  });

  it("renders the brand name Health Made Clear", () => {
    render(<Header />);
    expect(screen.getByText("Health Made Clear")).toBeInTheDocument();
  });

  it("renders a login link when no user is present", () => {
    render(<Header />);
    expect(screen.getByText("auth.loginButton")).toBeInTheDocument();
  });

  it("renders the sign-out button and dashboard link when a user is present", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "u1", email: "a@b.com", user_metadata: { display_name: "Alice" } },
      loading: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    render(<Header />);
    expect(screen.getByLabelText("auth.signOutAria")).toBeInTheDocument();
  });

  it("shows desktop nav at xl and hides the hamburger at xl", () => {
    render(<Header />);
    const desktopNav = screen.getByRole("navigation", { name: "nav.mainNavigation" });
    expect(desktopNav.className).toContain("xl:flex");
    expect(desktopNav.className).not.toContain("lg:flex");

    const hamburger = screen.getByRole("button", { name: "nav.toggleNavigation" });
    expect(hamburger.className).toContain("xl:hidden");
    expect(hamburger.className).toContain("min-h-11");
    expect(hamburger.className).toContain("min-w-11");
  });

  it("keeps a visible login word at xl with auth.loginButton as the accessible name", () => {
    render(<Header />);
    const login = screen.getByRole("link", { name: "auth.loginButton" });
    expect(login).toHaveAttribute("aria-label", "auth.loginButton");
    expect(login).toHaveAttribute("href", "/auth/login");
    expect(login.className).toBeTruthy();

    const word = screen.getByText("auth.loginButton");
    expect(word.tagName).toBe("SPAN");
    expect(word.className).not.toMatch(/\bxl:hidden\b/);
    expect(word.className).toContain("2xl:hidden");

    const signup = screen.getByText("auth.signupButton").closest("a");
    expect(signup?.className).toContain("xl:hidden");
  });

  it("opens a solid accordion sibling of the overflow-hidden glass bar", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "nav.toggleNavigation" }));

    const accordion = document.getElementById("mobile-menu");
    expect(accordion).not.toBeNull();
    expect(accordion?.className).toContain("max-h-[calc(100dvh-5rem)]");
    expect(accordion?.className).toContain("overflow-y-auto");
    expect(accordion?.className).toContain("overscroll-contain");
    expect(accordion?.className).toContain("bg-surface-container-lowest");
    expect(accordion?.className).toContain("rounded-b-[1.5rem]");
    expect(accordion?.className).not.toContain("max-w-md");

    const glass = document.querySelector(".surface-card-glass");
    expect(glass).not.toBeNull();
    expect(glass?.className).toContain("overflow-hidden");
    expect(glass?.contains(accordion)).toBe(false);
    expect(glass?.parentElement?.className).toContain("overflow-visible");
  });
});
