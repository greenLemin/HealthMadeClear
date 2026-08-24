"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function NetworkStatusBanner() {
  const t = useTranslations("common");
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize offline state from navigator.onLine on mount
    setOffline(!navigator.onLine);

    const handleOffline = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setDismissed(false);
      setOffline(true);
    };
    const handleOnline = () => {
      setDismissed(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setOffline(false);
        setDismissed(false);
      }, 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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
