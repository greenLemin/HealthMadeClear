"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { Search, X, BookOpen } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslations } from "next-intl";
import { searchIndex as searchIndexEn } from "@/data/searchIndex.en";
import { searchIndex as searchIndexEs } from "@/data/searchIndex.es";

type SearchEntry = {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId: string;
  content: string;
  url: string;
};

function getSearchEntries(locale: "en" | "es"): SearchEntry[] {
  return locale === "es" ? searchIndexEs : searchIndexEn;
}

function highlightMatches(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="rounded bg-primary-container text-on-primary-container px-0.5">
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
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  const entries = useMemo(() => getSearchEntries(locale), [locale]);

  const results = useMemo(() => {
    if (!query.trim()) return entries.slice(0, 5);
    const q = query.toLowerCase();
    return entries
      .filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      )
      .slice(0, 10);
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
        className="flex min-h-11 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface md:w-56"
        aria-label={t("openSearch")}
      >
        <Search size={16} />
        <span className="hidden md:inline">{t("placeholder")}</span>
        <kbd className="ml-auto hidden rounded border border-outline-variant bg-surface px-1.5 py-0.5 text-xs tracking-wider text-on-surface-variant md:inline">
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
            className="relative z-10 w-full max-w-xl rounded-xl border border-outline-variant bg-surface shadow-elevation-3"
          >
            <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-3">
              <Search size={20} className="text-on-surface-variant shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("placeholder")}
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
                    <li key={entry.id}>
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
                          <div className="mt-0.5 truncate text-sm text-on-surface-variant">
                            {highlightMatches(entry.description, query)}
                          </div>
                          <div className="mt-1">
                            <span className="inline-block rounded-full bg-surface-container px-2 py-0.5 text-xs text-on-surface-variant">
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
