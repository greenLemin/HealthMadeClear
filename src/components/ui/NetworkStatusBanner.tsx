"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NetworkStatusBanner() {
  const t = useTranslations("common");
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOffline = () => {
      setDismissed(false);
      setOffline(true);
    };
    const handleOnline = () => {
      setDismissed(true);
      setTimeout(() => {
        setOffline(false);
        setDismissed(false);
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-3 border-b border-tertiary/20 bg-tertiary-fixed px-4 py-3 text-center text-label-md font-semibold text-on-tertiary-fixed shadow-elevation-2 motion-safe:animate-slideDown"
    >
      <span>{t("offlineMessage")}</span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={t("dismiss")}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-on-tertiary-fixed hover:bg-tertiary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-tertiary-fixed focus-visible:ring-offset-2"
      >
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
