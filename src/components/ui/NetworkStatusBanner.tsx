"use client";

import { useEffect, useState } from "react";

export default function NetworkStatusBanner() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);

    const handleOffline = () => setOffline(true);
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
      className="fixed inset-x-0 top-0 z-[100] border-b border-tertiary/20 bg-tertiary-fixed px-4 py-3 text-center text-label-md font-semibold text-on-tertiary-fixed shadow-elevation-2 motion-safe:animate-slideDown"
    >
      You&apos;re offline. Some features may be unavailable.
    </div>
  );
}
