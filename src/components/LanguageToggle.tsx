"use client";

import { Languages } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n";
import { useTranslations } from "next-intl";

export default function LanguageToggle() {
  const { locale, setLocale } = useAppState();
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (next: Locale) => {
    if (next === locale) return;
    setLocale(next);
    router.replace(pathname, { locale: next });
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-2 py-2">
      <div className="hidden items-center gap-2 pl-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant sm:flex">
        <Languages size={14} />
        {t("language")}
      </div>
      <button
        type="button"
        lang="en"
        aria-pressed={locale === "en"}
        onClick={() => switchLocale("en")}
        className={
          locale === "en"
            ? "rounded-full bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary"
            : "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
        }
      >
        EN
      </button>
      <button
        type="button"
        lang="es"
        aria-pressed={locale === "es"}
        onClick={() => switchLocale("es")}
        className={
          locale === "es"
            ? "rounded-full bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-primary"
            : "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant"
        }
      >
        ES
      </button>
    </div>
  );
}
