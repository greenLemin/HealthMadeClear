"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/errorReporting";

const COPY = {
  en: {
    title: "Something went wrong",
    body: "We could not load this page. Your learning progress on this device is unchanged.",
    retry: "Try again",
  },
  es: {
    title: "Algo salió mal",
    body: "No pudimos cargar esta página. Tu progreso de aprendizaje en este dispositivo no cambió.",
    retry: "Intentar de nuevo",
  },
} as const;

function getLocaleFromCookie(): keyof typeof COPY {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)hmc-locale=(en|es)/);
  return match?.[1] === "es" ? "es" : "en";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = getLocaleFromCookie();
  const t = COPY[locale];

  useEffect(() => {
    reportClientError(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-surface p-8 font-hyperlegible text-on-surface">
        <main className="mx-auto max-w-lg">
          <h1 className="mb-3 text-2xl font-bold text-primary">{t.title}</h1>
          <p className="mb-6 text-on-surface-variant">{t.body}</p>
          <button type="button" className="btn-primary" onClick={() => reset()}>
            {t.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
