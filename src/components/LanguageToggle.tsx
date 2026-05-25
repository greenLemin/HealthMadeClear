"use client";

import { Languages } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale } = useAppState();
  const copy = getMessages(locale);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-2 py-2">
      <div className="hidden items-center gap-2 pl-2 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant sm:flex">
        <Languages size={14} />
        {copy.nav.language}
      </div>
      <button
        type="button"
        onClick={() => setLocale("en")}
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
        onClick={() => setLocale("es")}
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
