"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/errorReporting";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-surface p-8 font-sans text-on-surface">
        <main className="mx-auto max-w-lg">
          <h1 className="mb-3 text-2xl font-bold text-primary">Something went wrong</h1>
          <p className="mb-6 text-on-surface-variant">
            We could not load this page. Your learning progress on this device is unchanged.
          </p>
          <button type="button" className="btn-primary" onClick={() => reset()}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
