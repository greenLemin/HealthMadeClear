"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useRef, useState, type RefObject } from "react";
import {
  BookOpen,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
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
import ButtonLink from "@/components/ui/ButtonLink";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Skeleton from "@/components/ui/Skeleton";
import Logo from "@/components/Logo";
import TruncatedText from "@/components/ui/TruncatedText";
import NavLink from "@/components/header/NavLink";
import MobileMenu from "@/components/header/MobileMenu";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { revealEase } from "@/components/ui/animation";

const NotificationCenter = dynamic(() => import("@/components/ui/NotificationCenter"), { ssr: false });
const SearchDialog = dynamic(() => import("@/components/SearchDialog"), {
  ssr: false,
  loading: () => <Skeleton variant="button" width="44px" />,
});

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const ACCORDION_SHEET_CLASS =
  "max-h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain rounded-b-[1.5rem] border-x border-b border-outline-variant bg-surface-container-lowest px-4 pb-4 pt-3 shadow-elevation-1 xl:hidden md:px-6";

function getNavItems(t: ReturnType<typeof useTranslations<"nav">>): NavItem[] {
  return [
    { href: "/", label: t("home"), icon: <Home size={18} /> },
    { href: "/learn", label: t("learn"), icon: <BookOpen size={18} /> },
    { href: "/articles", label: t("articles"), icon: <BookOpen size={18} /> },
    { href: "/learning-paths", label: t("paths"), icon: <Route size={18} /> },
    { href: "/tools", label: t("tools"), icon: <Wrench size={18} /> },
    { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard size={18} /> },
    { href: "/glossary", label: t("glossary"), icon: <Search size={18} /> },
    { href: "/about", label: t("about"), icon: <Info size={18} /> },
  ];
}

function AccordionSheet({
  navItems,
  pathname,
  t,
  motionSafe,
  menuRef,
  onClose,
}: {
  navItems: NavItem[];
  pathname: string;
  t: ReturnType<typeof useTranslations<"nav">>;
  motionSafe: boolean;
  menuRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const content = (
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
            onClick={onClose}
          />
        ))}
      </nav>
      <MobileMenu onClose={onClose} />
    </>
  );

  if (motionSafe) {
    return (
      <div
        id="mobile-menu"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("mobileNavigation")}
        className={ACCORDION_SHEET_CLASS}
      >
        {content}
      </div>
    );
  }

  return (
    <motion.div
      id="mobile-menu"
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("mobileNavigation")}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: revealEase }}
      className={ACCORDION_SHEET_CLASS}
    >
      {content}
    </motion.div>
  );
}

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

  const navItems = getNavItems(t);

  const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById("main-content");
    main?.scrollIntoView();
    main?.focus();
  };

  async function handleSignOut() {
    await signOut();
  }

  const rawDisplayName = user?.user_metadata?.display_name;
  const displayName =
    (typeof rawDisplayName === "string" && rawDisplayName.trim()) || user?.email?.split("@")[0] || "";

  return (
    <header className="no-print sticky top-0 z-50 px-3 pt-3 md:px-4 xl:px-1">
      <a
        href="#main-content"
        onClick={handleSkip}
        className="fixed -top-24 left-4 z-[100] rounded-full bg-primary px-6 py-3 text-on-primary shadow-elevation-3 transition-all duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-on-primary focus:ring-offset-2 motion-reduce:transition-none"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto max-w-container overflow-visible">
        <div className="surface-card-glass relative overflow-hidden px-4 md:px-6 xl:px-1.5">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

          <div className="flex min-h-[76px] items-center justify-between gap-4 py-3 xl:gap-1">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-3 xl:gap-2"
              onClick={() => setIsOpen(false)}
            >
              <Logo className="h-12 w-12 shadow-elevation-1 rounded-[1.25rem] xl:h-10 xl:w-10" />
              <div className="min-w-0">
                <span className="block truncate font-display text-[1.45rem] leading-none text-primary xl:text-lg">
                  Health Made Clear
                </span>
                <span className="mt-1 hidden text-label-sm uppercase tracking-[0.14em] text-on-surface-variant 2xl:block">
                  {t("taglineShort")}
                </span>
              </div>
            </Link>

            <nav
              className="hidden items-center gap-0.5 rounded-full bg-surface-container-low/80 p-1.5 shadow-elevation-1 xl:flex xl:gap-0 xl:p-0.5"
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

            <div className="hidden items-center gap-2 lg:gap-3 lg:flex xl:gap-1">
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
                    <TruncatedText className="max-w-[120px] truncate 2xl:max-w-[80px]">
                      {displayName}
                    </TruncatedText>
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
                    className="min-h-11 px-4 text-label-md xl:px-3 xl:text-label-sm 2xl:flex 2xl:w-11 2xl:px-0 2xl:justify-center"
                    aria-label={authT("loginButton")}
                  >
                    <LogIn size={18} aria-hidden="true" className="hidden 2xl:block" />
                    <span className="xl:inline 2xl:hidden">{authT("loginButton")}</span>
                  </ButtonLink>
                  <ButtonLink href="/auth/signup" size="sm" className="min-h-11 px-4 text-label-md xl:hidden">
                    {authT("signupButton")}
                  </ButtonLink>
                </div>
              )}

              <div className="flex items-center gap-2 rounded-full bg-surface-container-low/80 p-1.5 shadow-elevation-1 xl:gap-1 xl:p-1">
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
              aria-controls={isOpen ? "mobile-menu" : undefined}
              aria-label={t("toggleNavigation")}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <AccordionSheet
              navItems={navItems}
              pathname={pathname}
              t={t}
              motionSafe={motionSafe}
              menuRef={mobileMenuRef}
              onClose={() => setIsOpen(false)}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
