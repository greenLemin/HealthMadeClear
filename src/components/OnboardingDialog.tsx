"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Route, Search, X } from "lucide-react";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const ONBOARDING_KEY = "hmc_onboarded";

export default function OnboardingDialog() {
  const t = useTranslations("onboarding");
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  useFocusTrap(dialogRef, visible);
  useDismissibleOverlay({
    isOpen: visible,
    onClose: dismiss,
    containerRef: dialogRef,
    lockBodyScroll: true,
  });

  useEffect(() => {
    if (!visible) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="relative z-10 w-full max-w-lg rounded-xl border border-outline-variant bg-surface p-6 shadow-elevation-3 md:p-8"
      >
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          aria-label={t("close")}
        >
          <X size={18} />
        </button>

        <h2 id="onboarding-title" className="mb-1 text-headline-lg text-primary">
          {t("welcome")}
        </h2>
        <p className="mb-6 text-body-md text-on-surface-variant">{t("subtitle")}</p>

        <div className="mb-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{t("step1Title")}</p>
              <p className="text-label-md text-on-surface-variant">{t("step1Body")}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
              <Route size={20} />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{t("step2Title")}</p>
              <p className="text-label-md text-on-surface-variant">{t("step2Body")}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container text-on-surface">
              <Search size={20} />
            </div>
            <div>
              <p className="font-semibold text-on-surface">{t("step3Title")}</p>
              <p className="text-label-md text-on-surface-variant">{t("step3Body")}</p>
            </div>
          </div>
        </div>

        <button onClick={dismiss} className="btn-primary w-full">
          {t("getStarted")}
        </button>
      </div>
    </div>
  );
}
