"use client";

import { Languages } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n";
import { useTranslations } from "next-intl";

const LOCALES: Locale[] = ["en", "es"];

export default function LanguageToggle() {
  const { locale, setLocale } = useAppState();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    router.replace(pathname, { locale: next, scroll: false });
  };

  const handleKeyDown = (event: React.KeyboardEvent, current: Locale) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const index = LOCALES.indexOf(current);
    const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
    switchLocale(LOCALES[(index + delta + LOCALES.length) % LOCALES.length]);
  };

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-2 py-2"
      role="radiogroup"
      aria-label={t("language")}
    >
      <div className="hidden items-center gap-2 pl-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant sm:flex">
        <Languages size={14} aria-hidden="true" />
        {t("language")}
      </div>
      <button
        type="button"
        lang="en"
        role="radio"
        aria-checked={locale === "en"}
        aria-label={t("switchToEnglish")}
        onClick={() => switchLocale("en")}
        onKeyDown={(event) => handleKeyDown(event, "en")}
        className={
          locale === "en"
            ? "rounded-full bg-primary px-3 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-primary"
            : "rounded-full px-3 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
        }
      >
        EN
      </button>
      <button
        type="button"
        lang="es"
        role="radio"
        aria-checked={locale === "es"}
        aria-label={t("switchToSpanish")}
        onClick={() => switchLocale("es")}
        onKeyDown={(event) => handleKeyDown(event, "es")}
        className={
          locale === "es"
            ? "rounded-full bg-primary px-3 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-primary"
            : "rounded-full px-3 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
        }
      >
        ES
      </button>
    </div>
  );
}
