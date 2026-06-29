"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tDisclaimer = useTranslations("disclaimer");

  return (
    <footer className="no-print px-3 pb-4 pt-8 md:px-4 md:pb-5">
      <div className="mx-auto max-w-container">
        <div className="surface-card-glass overflow-hidden px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.45fr_0.9fr_0.9fr]">
            <div>
              <div className="eyebrow mb-4">{tNav("about")}</div>
              <h2 className="font-display text-headline-lg text-primary">Health Made Clear</h2>
              <p className="mt-4 max-w-xl text-body-md text-on-surface-variant">{t("tagline")}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="metric-pill">{tNav("learn")}</span>
                <span className="metric-pill">{tNav("glossary")}</span>
                <span className="metric-pill">{tNav("tools")}</span>
              </div>
            </div>

            <nav aria-label={t("platform")}>
              <h2 className="mb-4 text-label-md font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                {t("platform")}
              </h2>
              <ul className="space-y-3 text-body-md text-on-surface">
                <li>
                  <Link href="/about" className="transition-colors hover:text-primary">
                    {tNav("about")}
                  </Link>
                </li>
                <li>
                  <Link href="/learning-paths" className="transition-colors hover:text-primary">
                    {tNav("paths")}
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="transition-colors hover:text-primary">
                    {tNav("tools")}
                  </Link>
                </li>
                <li>
                  <Link href="/glossary" className="transition-colors hover:text-primary">
                    {tNav("glossary")}
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label={t("legal")}>
              <h2 className="mb-4 text-label-md font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                {t("legal")}
              </h2>
              <ul className="space-y-3 text-body-md text-on-surface">
                <li>
                  <Link href="/accessibility" className="transition-colors hover:text-primary">
                    {t("accessibility")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-primary">
                    {t("privacy")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-primary">
                    {t("terms")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="transition-colors hover:text-primary">
                    {t("contact")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="surface-card-strong px-5 py-5 text-body-md text-on-surface-variant">
              {tDisclaimer("educationalLong")}
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-outline-variant pt-4 text-label-md text-on-surface-variant lg:border-t-0 lg:pt-0">
              <span>© {new Date().getFullYear()} Health Made Clear.</span>
              <span>{t("rights")}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
