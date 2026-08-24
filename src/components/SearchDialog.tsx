"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Mark hydration complete on mount; shortcut label depends on it
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

  const contentProps = {
    t,
    close,
    inputRef,
    query,
    setQuery,
    results,
    noResultsTitle,
    noResultsDescription,
  };

  return (
    <>
      <SearchTrigger triggerRef={triggerRef} setIsOpen={setIsOpen} t={t} shortcutLabel={shortcutLabel} />

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
                <SearchDialogContent {...contentProps} />
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
                <SearchDialogContent {...contentProps} />
              </motion.div>
            )}
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
