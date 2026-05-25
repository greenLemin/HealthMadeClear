"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen, Home, Info, LayoutDashboard, Menu, Search, Wrench, X } from "lucide-react";
import AccessibilityControls from "@/components/AccessibilityControls";
import LanguageToggle from "@/components/LanguageToggle";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const { locale } = useAppState();
  const copy = getMessages(locale);

  const navItems = [
    { href: "/", label: copy.nav.home, icon: <Home size={18} /> },
    { href: "/learn", label: copy.nav.learn, icon: <BookOpen size={18} /> },
    { href: "/learning-paths", label: copy.nav.paths, icon: <BookOpen size={18} /> },
    { href: "/tools", label: copy.nav.tools, icon: <Wrench size={18} /> },
    { href: "/dashboard", label: copy.nav.dashboard, icon: <LayoutDashboard size={18} /> },
    { href: "/glossary", label: copy.nav.glossary, icon: <Search size={18} /> },
    { href: "/about", label: copy.nav.about, icon: <Info size={18} /> },
  ];

  // Close mobile menu on Escape key and clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    // Prevent scrolling when menu is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-outline-variant bg-surface/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary focus:shadow-elevation-2"
      >
        {locale === "es" ? "Saltar al contenido principal" : "Skip to main content"}
      </a>
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="logo-mark flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-on-primary shadow-sm">
              H
            </div>
            <div className="hidden sm:block">
              <span className="block text-label-lg text-primary">Health Made Clear</span>
              <span className="text-xs uppercase tracking-[0.08em] text-on-surface-variant">{locale === "es" ? "Aprendizaje claro de salud" : "Clear health learning"}</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label={locale === "es" ? "Navegación principal" : "Main navigation"}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)}
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
            className="rounded-lg border border-outline-variant p-2 text-primary lg:hidden"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={copy.nav.toggleNavigation}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isOpen ? (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="border-t border-outline-variant py-4 lg:hidden"
          >
            <div className="mb-4 md:hidden">
              <div className="mb-3">
                <LanguageToggle />
              </div>
              <AccessibilityControls />
            </div>
            <nav className="grid gap-2" aria-label={locale === "es" ? "Navegación móvil" : "Mobile navigation"}>
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`)}
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
  icon: ReactNode;
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
