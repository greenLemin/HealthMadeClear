"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { normalizeGlossaryLetter } from "@/lib/i18n";
import { getGlossaryLabelFromBundle } from "@/lib/glossary/loadGlossary";
import { getLessonById } from "@/lib/localizedContent";
import type { GlossaryTerm } from "@/types/glossary";
import { useTranslations } from "next-intl";

const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

type GlossaryClientProps = {
  terms: GlossaryTerm[];
};

export default function GlossaryClient({ terms: glossaryTerms }: GlossaryClientProps) {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("All");
  const { locale } = useAppState();
  const t = useTranslations("glossary");
  const tCommon = useTranslations("common");
  const allLabel = tCommon("all");
  const showAlphabet = locale === "en";

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const element = document.getElementById(hash);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const searchableTerms = useMemo(() => {
    return glossaryTerms.map((term) => ({
      ...term,
      lowerTerm: term.term.toLowerCase(),
      lowerDefinition: term.definition.toLowerCase(),
      lowerCategory: term.category.toLowerCase(),
      normalized: normalizeGlossaryLetter(term.term),
    }));
  }, [glossaryTerms]);

  const filteredTerms = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return searchableTerms.filter((term) => {
      const matchesLetter = activeLetter === "All" || term.normalized === activeLetter;

      if (!matchesLetter) return false;
      if (!lowerQuery) return true;

      const matchesQuery =
        term.lowerTerm.includes(lowerQuery) ||
        term.lowerDefinition.includes(lowerQuery) ||
        term.lowerCategory.includes(lowerQuery);
      return matchesQuery;
    });
  }, [activeLetter, searchableTerms, query]);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={t("title")} description={t("description")} />

        <label className="relative mb-8 block max-w-xl">
          <span className="sr-only">{tCommon("searchTerms")}</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
            size={18}
          />
          <input
            className="input-field pl-12"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tCommon("searchTerms")}
            aria-describedby="glossary-results-count"
          />
        </label>

        {showAlphabet ? (
          <div className="mb-8 flex flex-wrap gap-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setActiveLetter(letter)}
                aria-pressed={activeLetter === letter}
                className={
                  activeLetter === letter
                    ? "flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-label-md font-semibold text-on-primary"
                    : "flex h-10 min-w-10 items-center justify-center rounded-lg bg-surface-container px-3 text-label-md font-semibold text-on-surface-variant"
                }
              >
                {letter === "All" ? allLabel : letter}
              </button>
            ))}
          </div>
        ) : null}

        <div
          id="glossary-results-count"
          className="mb-4 text-label-md text-on-surface-variant"
          aria-live="polite"
        >
          {filteredTerms.length > 0
            ? `${filteredTerms.length} ${tCommon("termsFound")}`
            : tCommon("noTermsFound")}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {filteredTerms.map((term) => (
            <article key={term.id} id={term.id} className="card scroll-mt-24">
              <h2 className="mb-4 text-headline-md text-primary">
                <Link href={`/glossary/${term.id}`} className="hover:underline">
                  {term.term}
                </Link>
              </h2>
              <p className="mb-5 text-body-md text-on-surface-variant">{term.definition}</p>
              <div className="border-t border-outline-variant pt-4">
                {term.relatedLessons?.length ? (
                  <div className="mb-4">
                    <div className="mb-2 text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
                      {t("seenIn")}
                    </div>
                    <div className="flex flex-col gap-1">
                      {term.relatedLessons.map((lessonId) => {
                        const lesson = getLessonById(lessonId, locale);
                        if (!lesson) return null;
                        return (
                          <Link
                            key={lessonId}
                            href={`/learn/${lessonId}`}
                            className="text-label-md font-semibold text-primary hover:underline"
                          >
                            {lesson.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                <div className="mb-2 text-label-md font-semibold text-primary">
                  {tCommon("category")}: {term.category}
                </div>
                {term.relatedTerms?.length ? (
                  <div>
                    <div className="mb-2 text-label-md font-semibold uppercase tracking-wide text-on-surface-variant">
                      {tCommon("relatedTerms")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {term.relatedTerms.map((related) => (
                        <Link
                          key={related}
                          href={`/glossary/${related}`}
                          className="rounded-full bg-surface-container px-3 py-1 text-label-md font-semibold text-primary hover:bg-secondary-container"
                        >
                          {getGlossaryLabelFromBundle(related, locale)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {filteredTerms.length === 0 ? (
          <div className="card mt-6 text-center" role="status">
            <p className="text-body-md text-on-surface-variant">{tCommon("noResultsTryAnother")}</p>
            <button
              type="button"
              className="btn-secondary mt-4 inline-flex items-center"
              onClick={() => {
                setQuery("");
                setActiveLetter("All");
              }}
            >
              {tCommon("showAllTerms")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
