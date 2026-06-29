"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Route, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { revealEase } from "@/components/ui/Reveal";

const ONBOARDING_KEY = "hmc_onboarded";

export default function OnboardingDialog() {
  const t = useTranslations("onboarding");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const motionSafe = useMotionSafe();

  useEffect(() => {
    if (pathname !== "/") {
      setVisible(false);
      return;
    }
    setVisible(!localStorage.getItem(ONBOARDING_KEY));
  }, [pathname]);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
  };

  useDismissibleOverlay({
    isOpen: visible,
    onClose: dismiss,
    containerRef: dialogRef,
    lockBodyScroll: false,
  });

  const onboardingContent = (
    <div className="surface-card-glass px-5 py-5 md:px-6 md:py-6">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-all duration-300 ease-premium hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={t("close")}
      >
        <X size={18} aria-hidden="true" />
      </button>

      <div className="eyebrow mb-4">{t("welcome")}</div>
      <h2 id="onboarding-title" className="font-display text-headline-md text-primary">
        Health Made Clear
      </h2>
      <p className="mt-2 text-body-md text-on-surface-variant">{t("subtitle")}</p>

      <div className="mt-5 space-y-4">
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-fixed/80 text-primary shadow-elevation-1"
            aria-hidden="true"
          >
            <BookOpen size={18} />
          </div>
          <div>
            <p className="font-semibold text-on-surface">{t("step1Title")}</p>
            <p className="text-label-md text-on-surface-variant">{t("step1Body")}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-container/80 text-on-secondary-container shadow-elevation-1"
            aria-hidden="true"
          >
            <Route size={18} />
          </div>
          <div>
            <p className="font-semibold text-on-surface">{t("step2Title")}</p>
            <p className="text-label-md text-on-surface-variant">{t("step2Body")}</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface shadow-elevation-1"
            aria-hidden="true"
          >
            <Search size={18} />
          </div>
          <div>
            <p className="font-semibold text-on-surface">{t("step3Title")}</p>
            <p className="text-label-md text-on-surface-variant">{t("step3Body")}</p>
          </div>
        </div>
      </div>

      <button type="button" onClick={dismiss} className="btn-primary mt-6 w-full">
        {t("getStarted")}
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {visible ? (
        motionSafe ? (
          <aside
            ref={dialogRef}
            role="complementary"
            aria-labelledby="onboarding-title"
            className="no-print fixed bottom-4 right-4 z-[110] w-[min(24rem,calc(100vw-2rem))]"
          >
            {onboardingContent}
          </aside>
        ) : (
          <motion.aside
            ref={dialogRef}
            role="complementary"
            aria-labelledby="onboarding-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: revealEase }}
            className="no-print fixed bottom-4 right-4 z-[110] w-[min(24rem,calc(100vw-2rem))]"
          >
            {onboardingContent}
          </motion.aside>
        )
      ) : null}
    </AnimatePresence>
  );
}
