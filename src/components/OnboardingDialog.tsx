"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Route, Search, X, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { useDismissibleOverlay } from "@/hooks/useDismissibleOverlay";
import { useMotionSafe } from "@/hooks/useMotionSafe";
import { revealEase } from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

const ONBOARDING_KEY = "hmc_onboarded";

function StepItem({
  icon: Icon,
  iconBg,
  iconText,
  title,
  body,
}: {
  icon: LucideIcon;
  iconBg: string;
  iconText: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconText} shadow-elevation-1`}
        aria-hidden="true"
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="font-semibold text-on-surface">{title}</p>
        <p className="text-label-md text-on-surface-variant">{body}</p>
      </div>
    </div>
  );
}

function OnboardingContent({
  dismiss,
  t,
}: {
  dismiss: () => void;
  t: ReturnType<typeof useTranslations<"onboarding">>;
}) {
  return (
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
        <StepItem
          icon={BookOpen}
          iconBg="bg-primary-container"
          iconText="text-on-primary-container"
          title={t("step1Title")}
          body={t("step1Body")}
        />
        <StepItem
          icon={Route}
          iconBg="bg-secondary-container/80"
          iconText="text-on-secondary-container"
          title={t("step2Title")}
          body={t("step2Body")}
        />
        <StepItem
          icon={Search}
          iconBg="bg-surface-container"
          iconText="text-on-surface"
          title={t("step3Title")}
          body={t("step3Body")}
        />
      </div>

      <Button type="button" onClick={dismiss} fullWidth className="mt-6">
        {t("getStarted")}
      </Button>
    </div>
  );
}

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

  return (
    <AnimatePresence>
      {visible ? (
        motionSafe ? (
          <aside
            ref={dialogRef}
            role="complementary"
            aria-labelledby="onboarding-title"
            className="no-print fixed bottom-4 left-4 z-[110] w-[min(24rem,calc(100vw-2rem))]"
          >
            <OnboardingContent dismiss={dismiss} t={t} />
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
            className="no-print fixed bottom-4 left-4 z-[110] w-[min(24rem,calc(100vw-2rem))]"
          >
            <OnboardingContent dismiss={dismiss} t={t} />
          </motion.aside>
        )
      ) : null}
    </AnimatePresence>
  );
}
