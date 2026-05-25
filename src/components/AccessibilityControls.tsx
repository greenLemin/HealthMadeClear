"use client";

import { useEffect, useRef, useState } from "react";
import { Moon, Settings2, Sun, Type } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";

export default function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { locale, theme, setTheme, textSize, setTextSize, simpleMode, setSimpleMode } = useAppState();
  const copy = getMessages(locale);

  // Close on Escape and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
        {copy.accessibility.display}
      </button>

      {isOpen ? (
        <div
          id="accessibility-panel"
          ref={panelRef}
          role="dialog"
          aria-label={copy.accessibility.controls}
          className="absolute right-0 top-14 z-50 w-80 rounded-xl border border-outline-variant bg-surface p-5 shadow-elevation-2"
        >
          <div className="mb-5 text-label-lg text-primary">{copy.accessibility.controls}</div>

          <div className="mb-5">
            <div className="mb-2 flex items-center gap-2 text-label-md text-on-surface">
              <Type size={16} />
              {copy.accessibility.textSize}
            </div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={copy.accessibility.textSize}>
              {([
                ["standard", "A"],
                ["large", "A+"],
                ["largest", "A++"],
              ] as const).map(([value, label]) => (
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
            <div className="mb-2 text-label-md text-on-surface">{copy.accessibility.colorTheme}</div>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={copy.accessibility.colorTheme}>
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
                {copy.accessibility.light}
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
                {copy.accessibility.dark}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-surface-container-low px-4 py-4">
            <div>
              <div className="text-label-md text-on-surface">{copy.accessibility.simpleMode}</div>
              <div className="text-sm text-on-surface-variant">{copy.accessibility.simpleModeDescription}</div>
            </div>
            <button
              type="button"
              aria-pressed={simpleMode}
              onClick={() => setSimpleMode(!simpleMode)}
              className={simpleMode ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary" : "rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface"}
            >
              {simpleMode ? copy.accessibility.on : copy.accessibility.off}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
