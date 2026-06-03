import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Script from "next/script";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { atkinson } from "@/app/fonts";
import AppProviders from "@/components/AppProviders";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";
import { requireLocale } from "@/lib/locale";
import { PREFERENCE_BOOTSTRAP_SCRIPT } from "@/lib/preferences";
import { getSiteUrl } from "@/lib/site";
import "../globals.css";

const siteUrl = getSiteUrl();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = requireLocale(params.locale);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Health Made Clear - Understand Your Health",
      template: "%s | Health Made Clear",
    },
    description:
      "Free, accessible health education for everyone. Learn about health topics in plain language.",
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
      title: "Health Made Clear",
      description: "Free, accessible health education in plain language.",
      images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Health Made Clear" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Health Made Clear",
      description: "Free, accessible health education in plain language.",
      images: ["/og-image.svg"],
    },
    icons: {
      icon: "/favicon.svg",
    },
    manifest: "/manifest.json",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: { locale: string };
}>) {
  if (!hasLocale(routing.locales, params.locale)) {
    notFound();
  }

  const locale = requireLocale(params.locale);
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={atkinson.variable}>
      <head>
        <Script id="hmc-preferences" strategy="beforeInteractive">
          {PREFERENCE_BOOTSTRAP_SCRIPT}
        </Script>
      </head>
      <body className="min-h-screen bg-surface font-hyperlegible">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders locale={locale}>
            <div className="min-h-screen bg-surface text-on-surface">
              <Header />
              <div id="main-content" tabIndex={-1}>
                {children}
              </div>
              <Footer />
            </div>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
