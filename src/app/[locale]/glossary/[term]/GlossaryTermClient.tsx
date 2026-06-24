"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";
import { getGlossaryLabel, getGlossaryTerms, getLessonById } from "@/lib/localizedContent";
import { useTranslations } from "next-intl";
import type { GlossaryTerm } from "@/types/glossary";

export default function GlossaryTermClient({ term }: { term: GlossaryTerm }) {
  const t = useTranslations("glossary");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const { locale } = useAppState();
  const glossaryTerms = getGlossaryTerms(locale);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-label-md text-on-surface-variant">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                {tNav("home")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/glossary" className="hover:text-primary transition-colors">
                {tNav("glossary")}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="text-on-surface" aria-current="page">
                {term.term}
              </span>
            </li>
          </ol>
        </nav>
        <Link
          href="/glossary"
          className="mb-6 inline-flex items-center gap-2 text-label-md font-semibold text-primary"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {t("backToGlossary")}
        </Link>
        <h1 className="mb-4 text-headline-xl text-primary">{term.term}</h1>
        <p className="mb-6 text-label-md text-on-surface-variant">{term.category}</p>
        <div className="card prose-hmc mb-6 max-w-3xl text-body-md text-on-surface-variant">
          <MarkdownRenderer text={term.definition} glossaryTerms={glossaryTerms} />
        </div>

        {term.relatedLessons?.length ? (
          <div className="card mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-label-md text-primary">
              <GraduationCap size={20} aria-hidden="true" />
              {t("seenIn")}
            </h2>
            <ul className="space-y-2">
              {term.relatedLessons.map((lessonId) => {
                const lesson = getLessonById(lessonId, locale);
                if (!lesson) return null;
                return (
                  <li key={lessonId}>
                    <Link
                      href={`/learn/${lessonId}`}
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      {lesson.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {term.relatedTerms?.length ? (
          <div className="card">
            <h2 className="mb-3 text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
              {tCommon("relatedTerms")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {term.relatedTerms.map((related) => (
                <Link
                  key={related}
                  href={`/glossary/${related}`}
                  className="inline-flex min-h-11 items-center rounded-full bg-surface-container px-4 py-2 text-label-md font-semibold text-primary underline underline-offset-2 hover:bg-secondary-container"
                >
                  {getGlossaryLabel(related, locale)}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
