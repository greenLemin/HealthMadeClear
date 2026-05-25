import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppProviders from "@/components/AppProviders";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Health Made Clear - Understand Your Health",
  description: "Free, accessible health education for everyone. Learn about health topics in plain language.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface">
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
