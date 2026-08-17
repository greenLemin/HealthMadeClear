"use client";

import { Link } from "@/i18n/navigation";
import { Search, X, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SearchEntry } from "@/types/search";
import EmptyState from "@/components/ui/EmptyState";
import { highlightMatches } from "@/lib/search/highlightMatches";

interface SearchDialogContentProps {
  t: ReturnType<typeof useTranslations<"search">>;
  close: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (q: string) => void;
  results: SearchEntry[];
  noResultsTitle: string;
  noResultsDescription: string;
}

export function SearchDialogContent({
  t,
  close,
  inputRef,
  query,
  setQuery,
  results,
  noResultsTitle,
  noResultsDescription,
}: SearchDialogContentProps) {
  const typeLabel = (type: SearchEntry["type"]) => {
    switch (type) {
      case "lesson":
        return t("typeLesson");
      case "article":
        return t("typeArticle");
      case "glossary":
        return t("typeGlossary");
      case "path":
        return t("typePath");
      case "tool":
        return t("typeTool");
      default:
        return type;
    }
  };

  return (
    <>
      <h2 id="search-dialog-title" className="sr-only">
        {t("searchDialog")}
      </h2>
      <div className="border-b border-outline-variant px-5 py-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{t("searchDialog")}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label={t("close")}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="surface-card flex items-center gap-3 px-4 py-3">
          <Search size={20} className="shrink-0 text-on-surface-variant" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className="flex-1 border-0 bg-transparent text-body-md text-on-surface outline-none focus-visible:outline-none placeholder:text-on-surface-variant"
            autoComplete="off"
          />
          <kbd className="hidden rounded-full border border-outline-variant bg-surface px-2 py-1 text-label-sm tracking-[0.16em] text-on-surface-variant sm:inline">
            {t("escapeKey")}
          </kbd>
        </div>
      </div>

      <div className="max-h-[62vh] overflow-y-auto px-3 pb-3 pt-3">
        {results.length === 0 ? (
          <EmptyState
            variant="search"
            title={noResultsTitle}
            description={noResultsDescription}
            className="mx-1"
          />
        ) : (
          <ul className="space-y-2">
            {results.map((entry) => (
              <li key={`${entry.type}-${entry.id}`}>
                <Link
                  href={entry.url}
                  onClick={close}
                  className="surface-card group flex items-start gap-3 px-4 py-4 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-elevation-1">
                    <BookOpen size={18} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-body-md font-semibold text-on-surface">
                      {highlightMatches(entry.title, query)}
                    </div>
                    <div className="mt-1 text-label-md text-on-surface-variant">
                      {highlightMatches(entry.description, query)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="chip chip-active min-h-9 px-3 py-1 text-label-sm">
                        {typeLabel(entry.type)}
                      </span>
                      <span className="chip min-h-9 px-3 py-1 text-label-sm">
                        {highlightMatches(entry.category, query)}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
