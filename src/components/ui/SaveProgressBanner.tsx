"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { getGuestProgress } from "@/lib/guestProgress";
import { useAuth } from "@/hooks/useAuth";

const BANNER_DISMISSED_KEY = "hmc_save_progress_dismissed";

export default function SaveProgressBanner() {
  const t = useTranslations("auth");
  const { user, loading: authLoading } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (authLoading || user) return;
    const dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissed) return;
    const progress = getGuestProgress();
    if (progress.completedLessons.length > 0 || progress.quizAttempts.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, [authLoading, user]);

  function handleDismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch {}
  }

  if (!visible) return null;

  return (
    <div className="bg-secondary-container/40 border-b border-secondary/20">
      <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-4 py-3 md:px-6">
        <p className="text-body-md text-on-secondary-container">{t("saveProgressMessage")}</p>
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/auth/signup">
            <Button size="sm" variant="primary">
              {t("createAccountCta")}
            </Button>
          </Link>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-secondary-container hover:bg-secondary-container"
            aria-label={t("dismissBanner")}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
