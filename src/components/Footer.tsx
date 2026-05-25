"use client";

import Link from "next/link";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";

export default function Footer() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  return (
    <footer className="no-print mt-20 border-t border-outline-variant bg-surface-container-low/80">
      <div className="max-w-container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="mb-3 text-label-lg text-primary">Health Made Clear</p>
            <p className="max-w-md text-body-md text-on-surface-variant">
              {copy.footer.tagline}
            </p>
          </div>
          <div>
            <p className="mb-3 text-label-md text-primary">{copy.footer.platform}</p>
            <div className="space-y-2 text-body-md text-on-surface-variant">
              <div><Link href="/about">{copy.nav.about}</Link></div>
              <div><Link href="/learning-paths">{copy.nav.paths}</Link></div>
              <div><Link href="/tools">{copy.nav.tools}</Link></div>
            </div>
          </div>
          <div>
            <p className="mb-3 text-label-md text-primary">{copy.footer.legal}</p>
            <div className="space-y-2 text-body-md text-on-surface-variant">
              <div><Link href="/about">{copy.footer.accessibility}</Link></div>
              <div><Link href="/privacy">{copy.footer.privacy}</Link></div>
              <div><Link href="/about">{copy.footer.contact}</Link></div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-outline-variant pt-6 text-sm text-on-surface-variant">
          © 2026 Health Made Clear. {copy.footer.rights}
        </div>
      </div>
    </footer>
  );
}
