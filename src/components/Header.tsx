"use client";

import dynamic from "next/dynamic";
import { Link, usePathname } from "@/i18n/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
import ButtonLink from "@/components/ui/ButtonLink";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Skeleton from "@/components/ui/Skeleton";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { revealEase } from "@/components/ui/Reveal";

const NotificationCenter = dynamic(() => import("@/components/ui/NotificationCenter"), { ssr: false });

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("nav");
  const authT = useTranslations("auth");
  const { user, loading, signOut } = useAuth();
  const motionSafe = useMotionSafe();

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

  const mobileMenuContent = (
    <>
      <nav className="grid gap-2" aria-label={t("mobileNavigation")}>
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
            mobile
            onClick={() => setIsOpen(false)}
          />
        ))}
      </nav>

      <div className="mt-4 rounded-[1.5rem] bg-surface-container-low/70 p-4 shadow-elevation-1 md:hidden">
        <div className="space-y-3">
          <SearchDialog />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <AccessibilityControls />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-outline-variant/70 pt-4">
        {loading ? (
          <Skeleton variant="button" />
        ) : user ? (
          <div className="space-y-3">
            <div className="surface-card-muted flex items-center gap-3 px-4 py-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-on-primary shadow-elevation-1">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-label-md font-semibold text-on-surface">{displayName}</p>
                <p className="text-label-sm text-on-surface-variant">{t("dashboard")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-3 text-label-md font-semibold text-on-surface transition-all duration-300 ease-premium hover:bg-surface"
            >
              <LogOut size={18} />
              {authT("signOut")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ButtonLink href="/auth/login" onClick={() => setIsOpen(false)} variant="secondary" fullWidth>
              {authT("loginButton")}
            </ButtonLink>
            <ButtonLink href="/auth/signup" onClick={() => setIsOpen(false)} fullWidth>
              {authT("signupButton")}
            </ButtonLink>
          </div>
        )}
      </div>
    </>
  );

  return (
    <header className="no-print sticky top-0 z-50 px-3 pt-3 md:px-4">
      <a
        href="#main-content"
        onClick={handleSkip}
        className="fixed -top-24 left-4 z-[100] rounded-full bg-primary px-6 py-3 text-on-primary shadow-elevation-3 transition-all duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-on-primary focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto max-w-container">
        <div className="surface-card-glass relative overflow-hidden px-4 md:px-6">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

          <div className="flex min-h-[76px] items-center justify-between gap-4 py-3">
            <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
              <div className="logo-mark flex h-12 w-12 items-center justify-center rounded-[1.25rem] text-label-lg font-bold text-on-primary shadow-elevation-1">
                H
              </div>
              <div className="min-w-0">
                <span className="block truncate font-display text-[1.45rem] leading-none text-primary">
                  Health Made Clear
                </span>
                <span className="mt-1 hidden text-label-sm uppercase tracking-[0.14em] text-on-surface-variant sm:block">
                  {t("taglineShort")}
                </span>
              </div>
            </Link>

            <nav
              className="hidden items-center gap-1 rounded-full bg-surface-container-low/80 p-1.5 shadow-elevation-1 xl:flex"
              aria-label={t("mainNavigation")}
            >
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
                <Skeleton variant="button" width="110px" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <NotificationCenter />
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 rounded-full bg-surface-container-lowest/85 px-4 py-2.5 text-label-md text-primary shadow-elevation-1 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-elevation-2"
                  >
                    <User size={16} />
                    <span className="max-w-[120px] truncate">{displayName}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface hover:text-on-surface"
                    aria-label={authT("signOutAria")}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ButtonLink
                    href="/auth/login"
                    variant="secondary"
                    size="sm"
                    className="min-h-11 px-4 text-label-md"
                  >
                    {authT("loginButton")}
                  </ButtonLink>
                  <ButtonLink href="/auth/signup" size="sm" className="min-h-11 px-4 text-label-md">
                    {authT("signupButton")}
                  </ButtonLink>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-full bg-surface-container-low/80 p-1.5 shadow-elevation-1">
                <SearchDialog />
                <LanguageToggle />
                <ThemeToggle />
                <AccessibilityControls />
              </div>
            </div>

            <button
              ref={toggleButtonRef}
              type="button"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest/90 p-2.5 text-primary shadow-elevation-1 xl:hidden"
              onClick={() => setIsOpen((current) => !current)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={t("toggleNavigation")}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isOpen ? (
              motionSafe ? (
                <div
                  id="mobile-menu"
                  ref={mobileMenuRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={t("mobileNavigation")}
                  className="border-t border-outline-variant pb-4 pt-3 xl:hidden"
                >
                  {mobileMenuContent}
                </div>
              ) : (
                <motion.div
                  id="mobile-menu"
                  ref={mobileMenuRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label={t("mobileNavigation")}
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: revealEase }}
                  className="border-t border-outline-variant pb-4 pt-3 xl:hidden"
                >
                  {mobileMenuContent}
                </motion.div>
              )
            ) : null}
          </AnimatePresence>
        </div>
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
  mobile = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        mobile
          ? active
            ? "flex items-center gap-3 rounded-[1.25rem] bg-primary px-4 py-3 text-label-md font-semibold text-on-primary shadow-elevation-1"
            : "flex items-center gap-3 rounded-[1.25rem] bg-surface-container-lowest/75 px-4 py-3 text-label-md font-medium text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface hover:text-primary"
          : active
            ? "flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-label-md font-semibold text-on-primary shadow-elevation-1"
            : "flex items-center gap-2 rounded-full px-4 py-3 text-label-md font-medium text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface hover:text-primary"
      }
    >
      <span>{icon}</span>
      {label}
    </Link>
  );
}
