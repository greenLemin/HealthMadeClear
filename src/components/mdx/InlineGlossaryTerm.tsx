"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";

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

function Popover({
  term,
  triggerRect,
  onClose,
}: {
  term: GlossaryTermSummary;
  triggerRect: DOMRect;
  onClose: () => void;
}) {
  const t = useTranslations("glossary");
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverHeight, setPopoverHeight] = useState(0);
  const gap = 8;
  const popoverWidth = 288;

  useEffect(() => {
    if (popoverRef.current) {
      setPopoverHeight(popoverRef.current.offsetHeight);
    }
  }, []);

  const spaceAbove = triggerRect.top - gap;
  const spaceBelow = window.innerHeight - triggerRect.bottom - gap;
  const placeAbove = spaceAbove >= spaceBelow && spaceAbove >= 100;

  const top = placeAbove ? triggerRect.top - popoverHeight - gap : triggerRect.bottom + gap;

  const left = Math.max(
    8,
    Math.min(
      triggerRect.left + triggerRect.width / 2 - popoverWidth / 2,
      window.innerWidth - popoverWidth - 8
    )
  );

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={term.term}
      className="no-print fixed z-50 w-72 rounded-lg border border-outline-variant bg-surface p-4 shadow-elevation-2"
      style={{
        top: top < 8 ? 8 : top,
        left,
        opacity: popoverHeight === 0 ? 0 : 1,
        transition: "opacity 0.15s ease-out",
      }}
    >
      <span className="mb-1 block text-label-md font-bold text-primary">{term.term}</span>
      <span className="mb-3 block text-sm leading-relaxed text-on-surface-variant">{term.definition}</span>
      <Link
        href={`/glossary/${term.id}`}
        className="inline-flex text-xs font-semibold text-primary hover:underline"
        onClick={onClose}
      >
        {t("viewTerm")} &rarr;
      </Link>
    </div>
  );
}

export default function InlineGlossaryTerm({ term, displayText }: InlineGlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const t = useTranslations("glossary");
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setTriggerRect(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev && buttonRef.current) {
        setTriggerRect(buttonRef.current.getBoundingClientRect());
      } else {
        setTriggerRect(null);
      }
      return !prev;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        close();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    function handleScroll() {
      close();
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen, close]);

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className="no-print cursor-help border-b-2 border-dashed border-primary-container font-semibold text-primary hover:bg-primary-container/10 focus:bg-primary-container/20 focus:outline-none"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {displayText}
      </button>
      <span className="print-only font-semibold">{displayText}</span>

      {isOpen &&
        triggerRect &&
        typeof document !== "undefined" &&
        createPortal(<Popover term={term} triggerRect={triggerRect} onClose={close} />, document.body)}
    </span>
  );
}
