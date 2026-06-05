"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useRef, useState } from "react";
import { BookOpen, Home, Info, LayoutDashboard, Menu, Route, Search, Wrench, X } from "lucide-react";
import AccessibilityControls from "@/components/AccessibilityControls";
import LanguageToggle from "@/components/LanguageToggle";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslations } from "next-intl";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("nav");

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
    { href: "/learning-paths", label: t("paths"), icon: <Route size={18} /> },
    { href: "/tools", label: t("tools"), icon: <Wrench size={18} /> },
    { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard size={18} /> },
    { href: "/glossary", label: t("glossary"), icon: <Search size={18} /> },
    { href: "/about", label: t("about"), icon: <Info size={18} /> },
  ];

  const handleSkip = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const main = document.getElementById("main-content");
    main?.focus();
  };

  return (
    <header className="no-print sticky top-0 z-50 border-b border-outline-variant bg-surface/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <a
        href="#main-content"
        onClick={handleSkip}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary focus:shadow-elevation-2"
      >
        {t("skipToContent")}
      </a>
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="logo-mark flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-on-primary shadow-sm">
              H
            </div>
            <div className="hidden sm:block">
              <span className="block text-label-lg text-primary">Health Made Clear</span>
              <span className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">
                {t("taglineShort")}
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t("mainNavigation")}>
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
            <LanguageToggle />
            <AccessibilityControls />
          </div>

          <button
            ref={toggleButtonRef}
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-outline-variant p-2.5 text-primary lg:hidden"
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
            className="border-t border-outline-variant py-4 lg:hidden"
          >
            <div className="mb-4 md:hidden">
              <div className="mb-3">
                <LanguageToggle />
              </div>
              <AccessibilityControls />
            </div>
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
                  onClick={() => setIsOpen(false)}
                />
              ))}
            </nav>
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
          ? "flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-body-md font-semibold text-primary"
          : "flex items-center gap-2 rounded-lg px-4 py-2 text-body-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
      }
    >
      {icon}
      {label}
    </Link>
  );
}
