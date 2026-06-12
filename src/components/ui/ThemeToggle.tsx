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
      className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low text-primary hover:bg-surface-container transition-colors"
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
