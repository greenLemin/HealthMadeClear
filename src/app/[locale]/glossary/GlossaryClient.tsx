"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { normalizeGlossaryLetter } from "@/lib/i18n";
import { getGlossaryLabelFromBundle } from "@/lib/glossary/loadGlossary";
import { getLessonById } from "@/lib/localizedContent";
import type { GlossaryTerm } from "@/types/glossary";
import { useTranslations } from "next-intl";
import MarkdownRenderer from "@/components/mdx/MarkdownRenderer";

const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];
const CHIP_FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

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
  const showAlphabet = true;

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const element = document.getElementById(hash);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
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

  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof filteredTerms> = {};
    for (const term of filteredTerms) {
      const letter = term.normalized || "?";
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)));
  }, [filteredTerms]);

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
            className="w-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest px-4 py-3 pl-12 text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/15 focus:outline-none transition-all duration-200"
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
                    ? `flex h-11 min-w-11 items-center justify-center rounded-xl bg-primary px-3.5 text-label-md font-bold text-on-primary transition-all duration-200 shadow-sm ${CHIP_FOCUS}`
                    : `flex h-11 min-w-11 items-center justify-center rounded-xl bg-surface-container px-3.5 text-label-md font-semibold text-on-surface-variant transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:-translate-y-0.5 active:scale-95 ${CHIP_FOCUS}`
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

        {Object.entries(groupedTerms).map(([letter, terms]) => (
          <section key={letter} aria-labelledby={`glossary-letter-${letter}`} className="animate-fade-in-up">
            <h2
              id={`glossary-letter-${letter}`}
              className="mb-4 mt-8 text-headline-md text-primary first:mt-0"
            >
              {letter}
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {terms.map((term) => (
                <article
                  key={term.id}
                  id={term.id}
                  className="card scroll-mt-24 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-primary/20"
                >
                  <h3 className="mb-4 text-headline-md text-primary font-bold">
                    <Link
                      href={`/glossary/${term.id}`}
                      className="underline hover:no-underline hover:text-primary-container transition-colors"
                    >
                      {term.term}
                    </Link>
                  </h3>
                  <div className="mb-5">
                    <MarkdownRenderer text={term.definition} glossaryTerms={glossaryTerms} />
                  </div>
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
                                className="text-label-md font-semibold text-primary underline hover:underline"
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
                              className="inline-flex min-h-11 items-center rounded-full bg-surface-container px-4 py-2 text-label-md font-semibold text-primary underline hover:bg-secondary-container"
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
          </section>
        ))}

        {filteredTerms.length === 0 ? (
          <EmptyState
            variant="search"
            title={tCommon("noTermsFound")}
            description={tCommon("noResultsTryAnother")}
            action={{
              label: tCommon("showAllTerms"),
              onClick: () => {
                setQuery("");
                setActiveLetter("All");
              },
            }}
            className="card mt-6"
          />
        ) : null}
      </div>
    </div>
  );
}
