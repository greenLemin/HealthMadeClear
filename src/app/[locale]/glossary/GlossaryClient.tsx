"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { normalizeGlossaryLetter } from "@/lib/i18n";
import { getGlossaryLabel, getGlossaryTerms } from "@/lib/localizedContent";
import { useTranslations } from "next-intl";

const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function GlossaryClient() {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("All");
  const { locale } = useAppState();
  const t = useTranslations("glossary");
  const tCommon = useTranslations("common");
  const glossaryTerms = getGlossaryTerms(locale);
  const allLabel = tCommon("all");
  const showAlphabet = locale === "en";

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const element = document.getElementById(hash);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((term) => {
      const normalized = normalizeGlossaryLetter(term.term);
      const matchesLetter = activeLetter === "All" || normalized === activeLetter;
      const matchesQuery =
        term.term.toLowerCase().includes(query.toLowerCase()) ||
        term.definition.toLowerCase().includes(query.toLowerCase()) ||
        term.category.toLowerCase().includes(query.toLowerCase());
      return matchesLetter && matchesQuery;
    });
  }, [activeLetter, glossaryTerms, query]);

  return (
    <main className="py-12 md:py-16">
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
            {[allLabel, ...alphabet.slice(1)].map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setActiveLetter(letter === allLabel ? "All" : letter)}
                className={
                  (activeLetter === "All" ? allLabel : activeLetter) === letter
                    ? "flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary"
                    : "flex h-10 min-w-10 items-center justify-center rounded-lg bg-surface-container px-3 text-sm font-semibold text-on-surface-variant"
                }
              >
                {letter}
              </button>
            ))}
          </div>
        ) : null}

        <div id="glossary-results-count" className="mb-4 text-sm text-on-surface-variant" aria-live="polite">
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
                <div className="mb-2 text-sm font-semibold text-primary">
                  {tCommon("category")}: {term.category}
                </div>
                {term.relatedTerms?.length ? (
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                      {tCommon("relatedTerms")}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {term.relatedTerms.map((related) => (
                        <Link
                          key={related}
                          href={`/glossary/${related}`}
                          className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-primary hover:bg-secondary-container"
                        >
                          {getGlossaryLabel(related, locale)}
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
    </main>
  );
}
