"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Settings2, Sun, Type, X } from "lucide-react";
import { useAppState, type TextSize, type ThemeMode } from "@/components/AppProviders";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { useTranslations } from "next-intl";
import { modalVariants, revealEase } from "@/components/ui/Reveal";

const TEXT_SIZES: TextSize[] = ["standard", "large", "largest"];
const TEXT_SIZE_DISPLAY: Record<TextSize, string> = {
  standard: "A",
  large: "A+",
  largest: "A++",
};
const THEMES: ThemeMode[] = ["light", "dark"];

function handleArrowSelection<T extends string>(
  event: KeyboardEvent,
  options: readonly T[],
  current: T,
  onSelect: (value: T) => void
) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const index = options.indexOf(current);
  const delta = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  onSelect(options[(index + delta + options.length) % options.length]);
}

export default function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme, textSize, setTextSize, simpleMode, setSimpleMode } = useAppState();
  const t = useTranslations("accessibility");
  const tCommon = useTranslations("common");
  const motionSafe = useMotionSafe();

  useFocusTrap(panelRef, isOpen);
  useDismissibleOverlay({
    isOpen,
    onClose: () => setIsOpen(false),
    containerRef: panelRef,
    triggerRef,
    lockBodyScroll: true,
    returnFocusRef: triggerRef,
  });

  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if (event.shiftKey && (event.key === "A" || event.key === "a")) {
        event.preventDefault();
        setIsOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const textSizeLabels: Record<TextSize, string> = {
    standard: t("textSizeStandard"),
    large: t("textSizeLarge"),
    largest: t("textSizeLargest"),
  };

  const panelContent = (
    <>
      <div className="mb-5 flex items-start justify-between gap-3">
        <h2 id="accessibility-panel-title" className="text-label-lg text-primary">
          {t("controls")}
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={tCommon("dismiss")}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-label-md text-on-surface">
          <Type size={16} aria-hidden="true" />
          {t("textSize")}
        </div>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("textSize")}>
          {TEXT_SIZES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={textSize === value}
              aria-label={textSizeLabels[value]}
              onClick={() => setTextSize(value)}
              onKeyDown={(event) => handleArrowSelection(event, TEXT_SIZES, textSize, setTextSize)}
              className={
                textSize === value
                  ? "min-h-11 rounded-lg bg-primary px-3 py-3 text-label-md font-semibold text-on-primary"
                  : "min-h-11 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-label-md font-semibold text-on-surface"
              }
            >
              {TEXT_SIZE_DISPLAY[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <div className="mb-2 text-label-md text-on-surface">{t("colorTheme")}</div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t("colorTheme")}>
          <button
            type="button"
            role="radio"
            aria-checked={theme === "light"}
            onClick={() => setTheme("light")}
            onKeyDown={(event) => handleArrowSelection(event, THEMES, theme, setTheme)}
            className={
              theme === "light"
                ? "flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-label-md font-semibold text-on-primary"
                : "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-label-md font-semibold text-on-surface"
            }
          >
            <Sun size={16} aria-hidden="true" />
            {t("light")}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={theme === "dark"}
            onClick={() => setTheme("dark")}
            onKeyDown={(event) => handleArrowSelection(event, THEMES, theme, setTheme)}
            className={
              theme === "dark"
                ? "flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-label-md font-semibold text-on-primary"
                : "flex min-h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-label-md font-semibold text-on-surface"
            }
          >
            <Moon size={16} aria-hidden="true" />
            {t("dark")}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-4">
        <div>
          <div className="text-label-md text-on-surface">{t("simpleMode")}</div>
          <div id="simple-mode-description" className="text-label-md text-on-surface-variant">
            {t("simpleModeDescription")}
          </div>
        </div>
        <button
          type="button"
          aria-label={`${t("simpleMode")}, ${simpleMode ? t("on") : t("off")}`}
          aria-describedby="simple-mode-description"
          aria-pressed={simpleMode}
          onClick={() => setSimpleMode(!simpleMode)}
          className={
            simpleMode
              ? "inline-flex min-h-11 items-center rounded-full bg-primary px-4 py-2 text-label-md font-semibold text-on-primary"
              : "inline-flex min-h-11 items-center rounded-full border border-outline-variant px-4 py-2 text-label-md font-semibold text-on-surface"
          }
        >
          {simpleMode ? t("on") : t("off")}
        </button>
      </div>
    </>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="flex min-h-11 items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-label-md font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="accessibility-panel"
      >
        <Settings2 size={18} aria-hidden="true" />
        {t("display")}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            {motionSafe ? (
              <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: revealEase }}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                aria-hidden="true"
              />
            )}
            {motionSafe ? (
              <div
                id="accessibility-panel"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="accessibility-panel-title"
                className="fixed inset-x-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-outline-variant bg-surface p-5 shadow-elevation-2 sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-80 sm:max-h-none"
              >
                {panelContent}
              </div>
            ) : (
              <motion.div
                id="accessibility-panel"
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="accessibility-panel-title"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.22, ease: revealEase }}
                className="fixed inset-x-4 top-20 z-50 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-outline-variant bg-surface p-5 shadow-elevation-2 sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-80 sm:max-h-none"
              >
                {panelContent}
              </motion.div>
            )}
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
