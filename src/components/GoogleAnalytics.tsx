"use client";

import Script from "next/script";

export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (process.env.NODE_ENV !== "production" || !measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" src={`/ga-init.js?id=${measurementId}`} strategy="afterInteractive" />
    </>
  );
}
