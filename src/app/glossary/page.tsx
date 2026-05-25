"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";
import { getGlossaryLabel, getGlossaryTerms } from "@/lib/localizedContent";

const alphabet = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function GlossaryPage() {
  const [query, setQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("All");
  const { locale } = useAppState();
  const copy = getMessages(locale);
  const glossaryTerms = getGlossaryTerms(locale);
  const allLabel = locale === "es" ? "Todo" : copy.common.all;

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter((term) => {
      const matchesLetter = activeLetter === "All" || term.term.toUpperCase().startsWith(activeLetter);
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
        <PageHeader title={copy.glossary.title} description={copy.glossary.description} />

        <label className="relative mb-8 block max-w-xl">
          <span className="sr-only">{copy.common.searchTerms}</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input
            className="input-field pl-12"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.common.searchTerms}
            aria-describedby="glossary-results-count"
          />
        </label>

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

        <div id="glossary-results-count" className="mb-4 text-sm text-on-surface-variant" aria-live="polite">
          {filteredTerms.length > 0
            ? `${filteredTerms.length} ${copy.common.termsFound}`
            : copy.common.noTermsFound}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {filteredTerms.map((term) => (
            <article key={term.id} className="card">
              <h2 className="mb-4 text-headline-md text-primary">{term.term}</h2>
              <p className="mb-5 text-body-md text-on-surface-variant">{term.definition}</p>
              <div className="border-t border-outline-variant pt-4">
                <div className="mb-2 text-sm font-semibold text-primary">{copy.common.category}: {term.category}</div>
                {term.relatedTerms?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {term.relatedTerms.map((related) => (
                      <span key={related} className="rounded-full bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant">
                        {getGlossaryLabel(related, locale)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        {filteredTerms.length === 0 ? (
          <div className="card mt-6 text-center" role="status">
            <p className="text-body-md text-on-surface-variant">{copy.common.noResultsTryAnother}</p>
            <button
              type="button"
              className="btn-secondary mt-4 inline-flex items-center"
              onClick={() => {
                setQuery("");
                setActiveLetter("All");
              }}
            >
              {copy.common.showAllTerms}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
