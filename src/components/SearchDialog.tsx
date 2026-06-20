"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { Search, X, BookOpen } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslations } from "next-intl";
import type { SearchEntry } from "@/data/searchIndex.en";

export function highlightMatches(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded bg-primary-container px-0.5 text-on-primary-container">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function SearchDialog() {
  const t = useTranslations("search");
  const { locale } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    import(`@/data/searchIndex.${locale}.ts`).then((mod) => {
      if (active) setEntries(mod.searchIndex);
    });
    return () => {
      active = false;
    };
  }, [locale]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  useFocusTrap(dialogRef, isOpen);
  useDismissibleOverlay({
    isOpen,
    onClose: close,
    containerRef: dialogRef,
    triggerRef,
  });

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

  const results = useMemo(() => {
    if (!query.trim()) return entries.slice(0, 6);
    const q = query.toLowerCase();
    return entries
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      )
      .slice(0, 12);
  }, [query, entries]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((o) => !o);
      }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(true)}
        className="flex min-h-11 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:w-56"
        aria-label={t("openSearch")}
      >
        <Search size={16} />
        <span className="hidden md:inline">{t("placeholder")}</span>
        <kbd className="ml-auto hidden rounded border border-outline-variant bg-surface px-1.5 py-0.5 text-label-md tracking-wider text-on-surface-variant md:inline">
          ⌘K
        </kbd>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={close} aria-hidden="true" />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("searchDialog")}
            aria-describedby="search-results-count"
            className="relative z-10 w-full max-w-xl rounded-xl border border-outline-variant bg-surface shadow-elevation-3"
          >
            <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
              <Search size={20} className="shrink-0 text-on-surface-variant" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("placeholder")}
                aria-label={t("placeholder")}
                className="flex-1 border-0 bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
                autoComplete="off"
              />
              <button
                onClick={close}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                aria-label={t("close")}
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="p-4 text-center text-body-md text-on-surface-variant">{t("noResults")}</p>
              ) : (
                <ul className="space-y-1">
                  {results.map((entry) => (
                    <li key={`${entry.type}-${entry.id}`}>
                      <Link
                        href={entry.url}
                        onClick={close}
                        className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-surface-container"
                      >
                        <BookOpen size={18} className="mt-0.5 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="text-body-md font-semibold text-on-surface">
                            {highlightMatches(entry.title, query)}
                          </div>
                          <div className="mt-0.5 truncate text-label-md text-on-surface-variant">
                            {highlightMatches(entry.description, query)}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-block rounded-full bg-primary-container px-2 py-0.5 text-label-md text-on-primary-container">
                              {typeLabel(entry.type)}
                            </span>
                            <span className="inline-block rounded-full bg-surface-container px-2 py-0.5 text-label-md text-on-surface-variant">
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
          </div>
        </div>
      ) : null}
    </>
  );
}
