"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";
import type { Locale } from "@/lib/i18n";
import { trackPageView } from "@/lib/analytics";

export default function AnalyticsPageViewTracker({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const url = window.location.pathname + window.location.search;
    trackPageView(url, locale);
  }, [pathname, locale]);

  return null;
}
