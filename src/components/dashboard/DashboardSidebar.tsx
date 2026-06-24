"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LayoutDashboard, BarChart3, Award, Settings, Flame } from "lucide-react";

interface DashboardSidebarProps {
  displayName: string;
  email?: string;
  streak?: number;
}

export default function DashboardSidebar({ displayName, email, streak }: DashboardSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const initials = (displayName ?? t("defaultUser")).charAt(0).toUpperCase();

  const navItems = [
    { href: "/dashboard", label: t("navOverview"), icon: LayoutDashboard, exact: true },
    { href: "/dashboard/progress", label: t("navProgress"), icon: BarChart3, exact: false },
    { href: "/dashboard/achievements", label: t("navAchievements"), icon: Award, exact: false },
    { href: "/dashboard/settings", label: t("navSettings"), icon: Settings, exact: false },
  ];

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      <aside className="hidden md:flex md:w-[240px] md:flex-col md:shrink-0">
        <div className="sticky top-20 flex h-[calc(100vh-5rem)] flex-col gap-6 overflow-y-auto pb-8 pr-6">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-container-low p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-headline-md font-bold text-on-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-md font-semibold text-on-surface">
                {displayName ?? t("defaultUser")}
              </p>
              {email ? <p className="truncate text-label-sm text-on-surface-variant">{email}</p> : null}
            </div>
          </div>

          {streak && streak > 0 ? (
            <div className="flex items-center gap-2 rounded-full bg-tertiary-container/40 px-4 py-2 text-label-md font-semibold text-tertiary">
              <Flame size={18} aria-hidden="true" />
              <span>{t("streakDays", { count: streak })}</span>
            </div>
          ) : null}

          <nav className="flex flex-col gap-1" aria-label={t("navAria")}>
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-label-md font-semibold text-on-primary"
                      : "flex items-center gap-3 rounded-xl px-4 py-3 text-label-md font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
                  }
                >
                  <item.icon size={20} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-outline-variant bg-surface md:hidden"
        aria-label={t("navAria")}
      >
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 border-t-2 border-primary py-3 text-label-sm font-semibold text-primary"
                  : "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-3 text-label-sm text-on-surface-variant"
              }
            >
              <item.icon size={20} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
