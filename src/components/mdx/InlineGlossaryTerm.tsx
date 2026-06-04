"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

/** The minimal shape of a glossary term needed to render the popover. */
export interface GlossaryTermSummary {
  id: string;
  term: string;
  definition: string;
}

interface InlineGlossaryTermProps {
  term: GlossaryTermSummary;
  displayText: string;
}

export default function InlineGlossaryTerm({ term, displayText }: InlineGlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("glossary");
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="no-print cursor-help border-b-2 border-dashed border-primary-container font-semibold text-primary hover:bg-primary-container/10 focus:bg-primary-container/20 focus:outline-none"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {displayText}
      </button>
      <span className="print-only font-semibold">{displayText}</span>

      {isOpen && (
        <span
          role="dialog"
          aria-label={term.term}
          className="no-print absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-lg border border-outline-variant bg-surface p-4 shadow-elevation-2 block"
          style={{ animation: "fadeIn 0.15s ease-out" }}
        >
          <span className="block mb-1 text-label-md font-bold text-primary">{term.term}</span>
          <span className="block mb-3 text-sm leading-relaxed text-on-surface-variant">
            {term.definition}
          </span>
          <Link
            href={`/glossary/${term.id}`}
            className="inline-flex text-xs font-semibold text-primary hover:underline"
            onClick={() => setIsOpen(false)}
          >
            {t("viewTerm")} &rarr;
          </Link>
          <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1.5 rotate-45 border-b border-r border-outline-variant bg-surface" />
        </span>
      )}
    </span>
  );
}
