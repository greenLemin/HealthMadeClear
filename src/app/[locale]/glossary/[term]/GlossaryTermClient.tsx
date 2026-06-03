"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import type { GlossaryTerm } from "@/types/glossary";

export default function GlossaryTermClient({ term }: { term: GlossaryTerm }) {
  const t = useTranslations("glossary");

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <Link
          href="/glossary"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
        >
          <ArrowLeft size={18} />
          {t("backToGlossary")}
        </Link>
        <h1 className="mb-4 text-headline-xl text-primary">{term.term}</h1>
        <p className="mb-2 text-sm text-on-surface-variant">{term.category}</p>
        <div className="card whitespace-pre-line text-body-md text-on-surface-variant">{term.definition}</div>
      </div>
    </main>
  );
}
