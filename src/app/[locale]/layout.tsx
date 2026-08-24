import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { atkinson, newsreader } from "@/app/fonts";
import AppProviders from "@/components/AppProviders";
import AuthProvider from "@/components/providers/AuthProvider";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NetworkStatusBanner from "@/components/ui/NetworkStatusBanner";
import SaveProgressBanner from "@/components/ui/SaveProgressBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { routing } from "@/i18n/routing";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import AnalyticsPageViewTracker from "@/components/AnalyticsPageViewTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "../globals.css";

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#004349",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t("siteTitle"),
      template: "%s | Health Made Clear",
    },
    description: t("siteDescription"),
    keywords: [
      "health education",
      "patient education",
      "health literacy",
      "medications explained",
      "understand your health",
      "medical terms explained",
      "plain language health",
    ],
    authors: [{ name: "Health Made Clear" }],
    creator: "Health Made Clear",
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        en: `${siteUrl}/en`,
        es: `${siteUrl}/es`,
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: `${siteUrl}/${locale}`,
      siteName: "Health Made Clear",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Health Made Clear" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteTitle"),
      description: t("siteDescription"),
      images: ["/og-default.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [{ url: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
    },
    manifest: "/manifest.json",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const validLocale = requireLocale(locale);
  setRequestLocale(validLocale);
  const messages = await getMessages({ locale: validLocale });

  return (
    <html
      lang={validLocale}
      suppressHydrationWarning
      className={[atkinson.variable, newsreader.variable].join(" ")}
    >
      <head>
        <GoogleAnalytics />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- must block rendering to prevent theme/locale FOUC */}
        <script src="/pref-bootstrap.js" />
      </head>
      <body className="min-h-screen bg-background font-sans text-on-surface antialiased">
        <NextIntlClientProvider locale={validLocale} messages={messages}>
          <AppProviders locale={validLocale}>
            <AnalyticsPageViewTracker locale={validLocale} />
            <AuthProvider>
              <NetworkStatusBanner />
              <SaveProgressBanner />
              <div className="min-h-screen bg-surface text-on-surface">
                <Header />
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <ScrollToTop />
                <Footer />
              </div>
            </AuthProvider>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
