"use client";

import { Moon, Sun } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
  const { theme, setTheme } = useAppState();
  const t = useTranslations("accessibility");

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === "dark"}
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest/90 text-primary shadow-elevation-1 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface hover:shadow-elevation-2"
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
    >
      {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
