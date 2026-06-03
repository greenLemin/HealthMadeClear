"use client";

import { useRef, useState } from "react";
import { Moon, Settings2, Sun, Type } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useTranslations } from "next-intl";

export default function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme, textSize, setTextSize, simpleMode, setSimpleMode } = useAppState();
  const t = useTranslations("accessibility");

  useFocusTrap(panelRef, isOpen);
  useDismissibleOverlay({
    isOpen,
    onClose: () => setIsOpen(false),
    containerRef: panelRef,
    triggerRef,
    returnFocusRef: triggerRef,
  });

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="flex min-h-11 items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm font-semibold text-primary"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="accessibility-panel"
      >
        <Settings2 size={18} />
        {t("display")}
      </button>

      {isOpen ? (
        <div
          id="accessibility-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("controls")}
          className="absolute right-0 top-14 z-50 w-80 rounded-xl border border-outline-variant bg-surface p-5 shadow-elevation-2"
        >
          <div className="mb-5 text-label-lg text-primary">{t("controls")}</div>

          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-label-md text-on-surface">
              <Type size={16} />
              {t("textSize")}
            </div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("textSize")}>
              {(
                [
                  ["standard", "A"],
                  ["large", "A+"],
                  ["largest", "A++"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={textSize === value}
                  onClick={() => setTextSize(value)}
                  className={
                    textSize === value
                      ? "rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-on-primary"
                      : "rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-sm font-semibold text-on-surface"
                  }
                >
                  {label}
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
                className={
                  theme === "light"
                    ? "flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-on-primary"
                    : "flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-sm font-semibold text-on-surface"
                }
              >
                <Sun size={16} />
                {t("light")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={theme === "dark"}
                onClick={() => setTheme("dark")}
                className={
                  theme === "dark"
                    ? "flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-semibold text-on-primary"
                    : "flex items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-3 text-sm font-semibold text-on-surface"
                }
              >
                <Moon size={16} />
                {t("dark")}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-4">
            <div>
              <div className="text-label-md text-on-surface">{t("simpleMode")}</div>
              <div className="text-sm text-on-surface-variant">{t("simpleModeDescription")}</div>
            </div>
            <button
              type="button"
              aria-pressed={simpleMode}
              onClick={() => setSimpleMode(!simpleMode)}
              className={
                simpleMode
                  ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary"
                  : "rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface"
              }
            >
              {simpleMode ? t("on") : t("off")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
