"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";
import { Search, X, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SearchEntry, SearchEntryType } from "@/types/search";
import EmptyState from "@/components/ui/EmptyState";
import { highlightMatches } from "@/lib/search/highlightMatches";

const GROUP_ORDER: SearchEntryType[] = ["lesson", "path", "article", "glossary", "tool"];

const GROUP_BORDER: Record<SearchEntryType, string> = {
  lesson: "border-l-4 border-primary",
  path: "border-l-4 border-secondary",
  article: "border-l-4 border-error",
  glossary: "border-l-4 border-primary-container",
  tool: "border-l-4 border-outline-variant",
};

type IndexStatus = "loading" | "ready" | "error";

interface SearchDialogContentProps {
  t: ReturnType<typeof useTranslations<"search">>;
  close: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  query: string;
  setQuery: (q: string) => void;
  results: SearchEntry[];
  indexStatus?: IndexStatus;
  noResultsTitle: string;
  noResultsDescription: string;
}

type ResultGroupType = SearchEntryType | "other";

function groupResults(results: SearchEntry[]): { type: ResultGroupType; entries: SearchEntry[] }[] {
  const buckets = new Map<SearchEntryType, SearchEntry[]>();
  for (const type of GROUP_ORDER) buckets.set(type, []);
  const other: SearchEntry[] = [];

  for (const entry of results) {
    const bucket = buckets.get(entry.type);
    if (bucket) bucket.push(entry);
    else other.push(entry);
  }

  const groups: { type: ResultGroupType; entries: SearchEntry[] }[] = GROUP_ORDER.map((type) => ({
    type,
    entries: buckets.get(type) ?? [],
  })).filter((group) => group.entries.length > 0);

  if (other.length > 0) {
    groups.push({ type: "other", entries: other });
  }

  return groups;
}

export function SearchDialogContent({
  t,
  close,
  inputRef,
  query,
  setQuery,
  results,
  indexStatus = "ready",
  noResultsTitle,
  noResultsDescription,
}: SearchDialogContentProps) {
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const loading = indexStatus === "loading";
  const emptyQuery = query.trim() === "";

  useEffect(() => {
    const node = liveRegionRef.current;
    if (!node) return;

    const timer = window.setTimeout(() => {
      if (loading) {
        node.textContent = t("loadingIndex");
        return;
      }
      if (emptyQuery) {
        node.textContent = "";
        return;
      }
      node.textContent = t("resultsFound", { count: results.length });
    }, 350);

    return () => window.clearTimeout(timer);
  }, [emptyQuery, loading, results.length, t]);

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

  const groupLabel = (type: string) => {
    switch (type) {
      case "lesson":
        return t("groupLessons");
      case "path":
        return t("groupPaths");
      case "article":
        return t("groupArticles");
      case "glossary":
        return t("groupGlossary");
      case "tool":
        return t("groupTools");
      default:
        return t("groupOther");
    }
  };

  const grouped = groupResults(results);

  return (
    <>
      <h2 id="search-dialog-title" className="sr-only">
        {t("searchDialog")}
      </h2>
      <div
        id="search-results-live"
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />
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

      <div
        className="max-h-[calc(100svh-12rem)] overflow-y-auto overscroll-contain px-3 pb-3 pt-3"
        aria-busy={loading || undefined}
      >
        {loading ? (
          <p className="px-2 py-6 text-body-md text-on-surface-variant">{t("loadingIndex")}</p>
        ) : indexStatus === "error" ? (
          <p className="px-2 py-6 text-body-md text-on-surface-variant">{t("indexError")}</p>
        ) : emptyQuery && results.length === 0 ? null : results.length === 0 ? (
          <EmptyState
            variant="search"
            title={noResultsTitle}
            description={noResultsDescription}
            className="mx-1"
          />
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => {
              const borderClass =
                group.type === "other" ? "border-l-4 border-outline-variant" : GROUP_BORDER[group.type];

              return (
                <section key={group.type} className={`${borderClass} pl-3`}>
                  <h3 className="px-1 pb-2 text-label-md font-semibold text-on-surface-variant">
                    {groupLabel(group.type)} ({group.entries.length})
                  </h3>
                  <ul className="space-y-2">
                    {group.entries.map((entry) => (
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
                </section>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
