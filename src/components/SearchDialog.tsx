"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAppState } from "@/components/AppProviders";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useTranslations } from "next-intl";
import type { SearchEntry } from "@/types/search";
import { modalVariants, revealEase } from "@/components/ui/animation";
import { SearchTrigger, getShortcutLabel } from "@/components/search/SearchTrigger";
import { SearchDialogContent } from "@/components/search/SearchDialogContent";

export default function SearchDialog() {
  const t = useTranslations("search");
  const { locale } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [indexState, setIndexState] = useState<{
    locale: string | null;
    entries: SearchEntry[];
    status: "ready" | "error";
  }>({ locale: null, entries: [], status: "ready" });
  const [mounted, setMounted] = useState(false);
  const indexReady = indexState.locale === locale;
  const indexStatus: "loading" | "ready" | "error" = indexReady ? indexState.status : "loading";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Mark hydration complete on mount; shortcut label depends on it
    setMounted(true);
  }, []);

  useEffect(() => {
    let active = true;
    import(`@/data/searchIndex.${locale}.ts`)
      .then((mod) => {
        if (!active) return;
        setIndexState({ locale, entries: mod.searchIndex, status: "ready" });
      })
      .catch(() => {
        if (!active) return;
        setIndexState({ locale, entries: [], status: "error" });
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

  // Pre-normalize index entries with lowercase strings to avoid redundant .toLowerCase() calls during search filtering
  const normalizedEntries = useMemo(() => {
    const entries = indexState.locale === locale ? indexState.entries : [];
    return entries.map((e) => ({
      ...e,
      lowerTitle: e.title.toLowerCase(),
      lowerDescription: e.description.toLowerCase(),
      lowerContent: e.content.toLowerCase(),
      lowerCategory: e.category.toLowerCase(),
    }));
  }, [indexState, locale]);

  // Optimize search results filtering with early exit single-pass loop over pre-normalized entries
  const results = useMemo(() => {
    if (!query.trim()) return normalizedEntries.slice(0, 6);
    const q = query.toLowerCase();
    const filtered: SearchEntry[] = [];
    for (let i = 0; i < normalizedEntries.length; i++) {
      const e = normalizedEntries[i];
      if (!e) continue;
      if (
        e.lowerTitle.includes(q) ||
        e.lowerDescription.includes(q) ||
        e.lowerContent.includes(q) ||
        e.lowerCategory.includes(q)
      ) {
        filtered.push(e);
        if (filtered.length >= 12) break;
      }
    }
    return filtered;
  }, [query, normalizedEntries]);

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

  const contentProps = {
    t,
    close,
    inputRef,
    query,
    setQuery,
    results,
    indexStatus,
    noResultsTitle,
    noResultsDescription,
  };

  const overlay = (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[100] isolate flex items-start justify-center px-4 pt-[10vh]">
          {motionSafe ? (
            <div className="fixed inset-0 bg-black/45 backdrop-blur-sm" onClick={close} aria-hidden="true" />
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
              aria-busy={indexStatus === "loading" || undefined}
              className="surface-card-glass relative z-10 w-full max-w-2xl overflow-hidden"
            >
              <SearchDialogContent {...contentProps} />
            </div>
          ) : (
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-dialog-title"
              aria-busy={indexStatus === "loading" || undefined}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.26, ease: revealEase }}
              className="surface-card-glass relative z-10 w-full max-w-2xl overflow-hidden"
            >
              <SearchDialogContent {...contentProps} />
            </motion.div>
          )}
        </div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={t} shortcutLabel={shortcutLabel} />
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
