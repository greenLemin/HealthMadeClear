"use client";

import { useEffect, useState } from "react";

export function formatPrintDate(locale: string, date: Date = new Date()): string {
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Print footer date. Refresh on `beforeprint` so overnight tabs are not stale. */
export function usePrintDate(locale: string): string {
  const [printDate, setPrintDate] = useState(() => formatPrintDate(locale));

  useEffect(() => {
    const refresh = () => setPrintDate(formatPrintDate(locale));
    refresh();
    window.addEventListener("beforeprint", refresh);
    return () => window.removeEventListener("beforeprint", refresh);
  }, [locale]);

  return printDate;
}
