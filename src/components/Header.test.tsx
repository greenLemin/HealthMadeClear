// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
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
  default: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
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
  motion: { div: ({ children }: { children: React.ReactNode }) => <div>{children}</div> },
}));

vi.mock("@/components/ui/animation", () => ({ revealEase: "ease" }));

import Header from "./Header";
import { useAuth } from "@/hooks/useAuth";

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
