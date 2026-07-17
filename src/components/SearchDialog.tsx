"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { Search, X, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "@/components/AppProviders";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useTranslations } from "next-intl";
import type { SearchEntry } from "@/data/searchIndex.en";
import EmptyState from "@/components/ui/EmptyState";
import { modalVariants, revealEase } from "@/components/ui/Reveal";

export function highlightMatches(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-primary-container px-0.5 text-on-primary-container">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function getShortcutLabel(t: ReturnType<typeof useTranslations<"search">>) {
  if (typeof navigator === "undefined") return t("shortcutWindows");

  const navWithUAData = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = navWithUAData.userAgentData?.platform || navigator.platform || "";
  const normalizedPlatform = platform.toLowerCase();

  return normalizedPlatform.includes("mac") ||
    normalizedPlatform.includes("iphone") ||
    normalizedPlatform.includes("ipad")
    ? t("shortcutMac")
    : t("shortcutWindows");
}

export default function SearchDialog() {
  const t = useTranslations("search");
  const { locale } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shortcutLabel = useMemo(() => (mounted ? getShortcutLabel(t) : null), [t, mounted]);
  const motionSafe = useMotionSafe();
  const noResultsMessage = t("noResults");
  const noResultsSplit = noResultsMessage.indexOf(". ");
  const noResultsTitle =
    noResultsSplit === -1 ? noResultsMessage : noResultsMessage.slice(0, noResultsSplit + 1);
  const noResultsDescription = noResultsSplit === -1 ? "" : noResultsMessage.slice(noResultsSplit + 2);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    lockBodyScroll: true,
    returnFocusRef: triggerRef,
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

  const searchDialogContent = (
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex min-h-11 items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest/90 px-3 py-2 text-label-md text-on-surface-variant shadow-elevation-1 transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface hover:text-on-surface hover:shadow-elevation-2 md:w-56 lg:w-11 xl:w-11 2xl:w-11 xl:justify-center 2xl:justify-center"
        aria-label={t("openSearch")}
      >
        <Search size={16} aria-hidden="true" />
        <span className="hidden md:inline lg:hidden">{t("placeholder")}</span>
        {shortcutLabel ? (
          <kbd className="ml-auto hidden rounded-full border border-outline-variant bg-surface px-2 py-0.5 text-label-sm tracking-[0.16em] text-on-surface-variant md:inline lg:hidden">
            {shortcutLabel}
          </kbd>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]">
            {motionSafe ? (
              <div
                className="fixed inset-0 bg-black/45 backdrop-blur-sm"
                onClick={close}
                aria-hidden="true"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: revealEase }}
                className="fixed inset-0 bg-black/45 backdrop-blur-sm"
                onClick={close}
                aria-hidden="true"
              />
            )}
            {motionSafe ? (
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-dialog-title"
                className="surface-card-glass relative z-10 w-full max-w-2xl overflow-hidden"
              >
                {searchDialogContent}
              </div>
            ) : (
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="search-dialog-title"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.26, ease: revealEase }}
                className="surface-card-glass relative z-10 w-full max-w-2xl overflow-hidden"
              >
                {searchDialogContent}
              </motion.div>
            )}
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
