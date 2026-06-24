"use client";

import dynamic from "next/dynamic";
import { Link, usePathname } from "@/i18n/navigation";
import { useRef, useState } from "react";
import {
  BookOpen,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Search,
  User,
  Wrench,
  X,
} from "lucide-react";
import AccessibilityControls from "@/components/AccessibilityControls";
import LanguageToggle from "@/components/LanguageToggle";
import SearchDialog from "@/components/SearchDialog";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Skeleton from "@/components/ui/Skeleton";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";

const NotificationCenter = dynamic(() => import("@/components/ui/NotificationCenter"), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("nav");
  const authT = useTranslations("auth");
  const { user, loading, signOut } = useAuth();

  useFocusTrap(mobileMenuRef, isOpen);
  useDismissibleOverlay({
    isOpen,
    onClose: () => setIsOpen(false),
    containerRef: mobileMenuRef,
    triggerRef: toggleButtonRef,
    lockBodyScroll: true,
    returnFocusRef: toggleButtonRef,
  });

  const navItems = [
    { href: "/", label: t("home"), icon: <Home size={18} /> },
    { href: "/learn", label: t("learn"), icon: <BookOpen size={18} /> },
    { href: "/articles", label: t("articles"), icon: <BookOpen size={18} /> },
    { href: "/learning-paths", label: t("paths"), icon: <Route size={18} /> },
    { href: "/tools", label: t("tools"), icon: <Wrench size={18} /> },
    { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard size={18} /> },
    { href: "/glossary", label: t("glossary"), icon: <Search size={18} /> },
    { href: "/about", label: t("about"), icon: <Info size={18} /> },
  ];

  const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById("main-content");
    main?.scrollIntoView();
    main?.focus();
  };

  async function handleSignOut() {
    await signOut();
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "";

  return (
    <header className="no-print sticky top-0 z-50 border-b border-outline-variant bg-surface/90 shadow-elevation-2 backdrop-blur-xl">
      <a
        href="#main-content"
        onClick={handleSkip}
        className="fixed -top-24 left-4 z-[100] rounded-lg bg-primary px-6 py-3 text-on-primary shadow-elevation-3 transition-all duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-on-primary focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t("skipToContent")}
      </a>
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="logo-mark flex h-11 w-11 items-center justify-center rounded-2xl text-label-lg font-bold text-on-primary shadow-sm">
              H
            </div>
            <div className="hidden sm:block">
              <span className="block text-label-lg text-primary">Health Made Clear</span>
              <span className="text-label-md uppercase tracking-[0.08em] text-on-surface-variant">
                {t("taglineShort")}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label={t("mainNavigation")}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
              />
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <Skeleton variant="button" width="100px" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg bg-surface-container px-3 py-2 text-label-md text-primary transition-colors hover:bg-surface-container-high"
                >
                  <User size={16} />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  aria-label={authT("signOutAria")}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="min-h-11 rounded-lg border-2 border-primary px-6 py-2 text-label-md font-semibold text-primary transition-colors hover:bg-surface-container-low"
                >
                  {authT("loginButton")}
                </Link>
                <Link
                  href="/auth/signup"
                  className="min-h-11 rounded-lg bg-primary px-6 py-2 text-label-md font-semibold text-on-primary transition-colors hover:bg-primary-container"
                >
                  {authT("signupButton")}
                </Link>
              </div>
            )}
            <SearchDialog />
            <LanguageToggle />
            <ThemeToggle />
            <AccessibilityControls />
          </div>

          <button
            ref={toggleButtonRef}
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-outline-variant p-2.5 text-primary xl:hidden"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={t("toggleNavigation")}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isOpen ? (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("mobileNavigation")}
            className="border-t border-outline-variant py-4 xl:hidden"
          >
            <nav className="mb-4 grid gap-2" aria-label={t("mobileNavigation")}>
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  }
                  onClick={() => setIsOpen(false)}
                />
              ))}
              <hr className="my-2 border-outline-variant" />
              {loading ? (
                <div className="px-4 py-2">
                  <Skeleton variant="button" />
                </div>
              ) : user ? (
                <div className="space-y-2 px-4 py-2">
                  <div className="flex items-center gap-2 text-label-md text-primary">
                    <User size={16} />
                    <span className="truncate">{displayName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-body-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  >
                    <LogOut size={18} />
                    {authT("signOut")}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 px-4 py-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-12 w-full items-center justify-center rounded-lg border-2 border-primary text-label-md font-semibold text-primary"
                  >
                    {authT("loginButton")}
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-12 w-full items-center justify-center rounded-lg bg-primary text-label-md font-semibold text-on-primary"
                  >
                    {authT("signupButton")}
                  </Link>
                </div>
              )}
            </nav>
            <div className="space-y-3 md:hidden">
              <SearchDialog />
              <LanguageToggle />
              <ThemeToggle />
              <AccessibilityControls />
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-body-md font-semibold text-primary border-b-2 border-primary"
          : "flex items-center gap-2 rounded-lg px-4 py-2 text-body-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary border-b-2 border-transparent"
      }
    >
      {icon}
      {label}
    </Link>
  );
}
