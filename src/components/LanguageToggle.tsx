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
      <div className="hidden items-center gap-2 pl-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant sm:flex xl:hidden 2xl:flex">
        <Languages size={14} aria-hidden="true" />
        {t("language")}
      </div>
      <button
        type="button"
        role="radio"
        aria-checked={locale === "en"}
        aria-label={t("switchToEnglish")}
        tabIndex={locale === "en" ? 0 : -1}
        onClick={() => switchLocale("en")}
        onKeyDown={(event) => handleKeyDown(event, "en")}
        className={
          locale === "en"
            ? "inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            : "inline-flex min-h-11 items-center rounded-full px-4 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        }
      >
        EN
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={locale === "es"}
        aria-label={t("switchToSpanish")}
        tabIndex={locale === "es" ? 0 : -1}
        onClick={() => switchLocale("es")}
        onKeyDown={(event) => handleKeyDown(event, "es")}
        className={
          locale === "es"
            ? "inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            : "inline-flex min-h-11 items-center rounded-full px-4 py-2 text-label-md font-semibold uppercase tracking-[0.08em] text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        }
      >
        ES
      </button>
    </div>
  );
}
