"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="no-print mt-20 border-t border-outline-variant bg-surface-container-low/80">
      <div className="max-w-container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="mb-3 text-label-lg text-primary">Health Made Clear</p>
            <p className="max-w-md text-body-md text-on-surface-variant">{t("tagline")}</p>
          </div>
          <div>
            <p className="mb-3 text-label-md text-primary">{t("platform")}</p>
            <div className="space-y-2 text-body-md text-on-surface-variant">
              <div>
                <Link href="/about">{tNav("about")}</Link>
              </div>
              <div>
                <Link href="/learning-paths">{tNav("paths")}</Link>
              </div>
              <div>
                <Link href="/tools">{tNav("tools")}</Link>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-3 text-label-md text-primary">{t("legal")}</p>
            <div className="space-y-2 text-body-md text-on-surface-variant">
              <div>
                <Link href="/accessibility">{t("accessibility")}</Link>
              </div>
              <div>
                <Link href="/privacy">{t("privacy")}</Link>
              </div>
              <div>
                <a href="mailto:hello@healthmadeclear.org">{t("contact")}</a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-outline-variant pt-6 text-sm text-on-surface-variant">
          © {new Date().getFullYear()} Health Made Clear. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
