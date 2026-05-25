import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { atkinson } from "@/app/fonts";
import AppProviders from "@/components/AppProviders";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PREFERENCE_BOOTSTRAP_SCRIPT } from "@/lib/preferences";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Health Made Clear - Understand Your Health",
    template: "%s | Health Made Clear",
  },
  description:
    "Free, accessible health education for everyone. Learn about health topics in plain language.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Health Made Clear",
    title: "Health Made Clear",
    description: "Free, accessible health education in plain language.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={atkinson.variable}>
      <head>
        <Script id="hmc-preferences" strategy="beforeInteractive">
          {PREFERENCE_BOOTSTRAP_SCRIPT}
        </Script>
      </head>
      <body className="min-h-screen bg-surface font-hyperlegible">
        <AppProviders>
          <div className="min-h-screen bg-surface text-on-surface">
            <Header />
            <div id="main-content" tabIndex={-1}>
              {children}
            </div>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
