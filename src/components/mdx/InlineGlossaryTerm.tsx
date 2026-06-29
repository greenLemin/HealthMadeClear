"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useOptionalScrollSpyContext } from "./ScrollSpyProvider";

/** The minimal shape of a glossary term needed to render the popover. */
export interface GlossaryTermSummary {
  id: string;
  term: string;
  definition: string;
}

interface InlineGlossaryTermProps {
  term: GlossaryTermSummary;
  displayText: string;
  instanceId?: string;
}

function Popover({
  term,
  triggerRect,
  onClose,
  popoverId,
}: {
  term: GlossaryTermSummary;
  triggerRect: DOMRect;
  onClose: () => void;
  popoverId: string;
}) {
  const t = useTranslations("glossary");
  const tCommon = useTranslations("common");
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverHeight, setPopoverHeight] = useState(0);
  const gap = 8;
  const popoverWidth = 288;

  useFocusTrap(popoverRef, true);

  useEffect(() => {
    if (popoverRef.current) {
      setPopoverHeight(popoverRef.current.offsetHeight);
      popoverRef.current.focus();
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
      id={popoverId}
      role="dialog"
      aria-modal="true"
      aria-label={term.term}
      tabIndex={-1}
      className="no-print fixed z-50 w-72 rounded-lg border border-outline-variant bg-surface p-4 shadow-elevation-2 transition-opacity duration-150 ease-out motion-reduce:transition-none focus:outline-none"
      style={{
        top: top < 8 ? 8 : top,
        left,
        opacity: popoverHeight === 0 ? 0 : 1,
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="block text-label-md font-bold text-primary">{term.term}</span>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={tCommon("dismiss")}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <span className="mb-3 block text-label-md leading-relaxed text-on-surface-variant">
        {term.definition}
      </span>
      <Link
        href={`/glossary/${term.id}`}
        className="inline-flex text-label-md font-semibold text-primary hover:underline"
        onClick={onClose}
      >
        {t("viewTerm")} &rarr;
      </Link>
    </div>
  );
}

export default function InlineGlossaryTerm({ term, displayText, instanceId }: InlineGlossaryTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const t = useTranslations("glossary");
  const containerRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollSpy = useOptionalScrollSpyContext();

  const isActive = instanceId && scrollSpy?.activeTermIds.has(instanceId);
  const popoverId = `glossary-popover-${term.id}${instanceId ? `-${instanceId}` : ""}`;

  useEffect(() => {
    if (!instanceId || !scrollSpy) return;
    scrollSpy.registerTerm(instanceId, buttonRef.current);
    return () => scrollSpy.unregisterTerm(instanceId);
  }, [instanceId, scrollSpy]);

  const close = useCallback(() => {
    setIsOpen(false);
    setTriggerRect(null);
    buttonRef.current?.focus();
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

  const baseClasses =
    "no-print cursor-help border-b-2 border-dashed border-primary-container font-semibold text-primary hover:bg-primary-container/10 focus:bg-primary-container/20 focus:outline-none transition-colors";
  const activeClasses = isActive ? "bg-primary-container/20 shadow-sm" : "";

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        id={instanceId}
        type="button"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className={`${baseClasses} ${activeClasses}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
      >
        {displayText}
      </button>
      <span className="print-only font-semibold">{displayText}</span>

      {isOpen &&
        triggerRect &&
        typeof document !== "undefined" &&
        createPortal(
          <Popover term={term} triggerRect={triggerRect} onClose={close} popoverId={popoverId} />,
          document.body
        )}
    </span>
  );
}
