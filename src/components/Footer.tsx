"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const NAV_LINK_CLASS = "inline-flex min-h-11 items-center py-2.5 transition-colors hover:text-primary";

function AboutSection() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
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
  );
}

function PlatformLinks() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <nav aria-label={t("platform")}>
      <h2 className="mb-4 text-label-md font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        {t("platform")}
      </h2>
      <ul className="space-y-3 text-body-md text-on-surface">
        <li>
          <Link href="/about" className={NAV_LINK_CLASS}>
            {tNav("about")}
          </Link>
        </li>
        <li>
          <Link href="/learning-paths" className={NAV_LINK_CLASS}>
            {tNav("paths")}
          </Link>
        </li>
        <li>
          <Link href="/tools" className={NAV_LINK_CLASS}>
            {tNav("tools")}
          </Link>
        </li>
        <li>
          <Link href="/glossary" className={NAV_LINK_CLASS}>
            {tNav("glossary")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function LegalLinks() {
  const t = useTranslations("footer");

  return (
    <nav aria-label={t("legal")}>
      <h2 className="mb-4 text-label-md font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        {t("legal")}
      </h2>
      <ul className="space-y-3 text-body-md text-on-surface">
        <li>
          <Link href="/accessibility" className={NAV_LINK_CLASS}>
            {t("accessibility")}
          </Link>
        </li>
        <li>
          <Link href="/privacy" className={NAV_LINK_CLASS}>
            {t("privacy")}
          </Link>
        </li>
        <li>
          <Link href="/terms" className={NAV_LINK_CLASS}>
            {t("terms")}
          </Link>
        </li>
        <li>
          <Link href="/contact" className={NAV_LINK_CLASS}>
            {t("contact")}
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function DisclaimerSection() {
  const tDisclaimer = useTranslations("disclaimer");

  return (
    <div className="surface-card-strong px-5 py-5 text-body-md text-on-surface-variant">
      {tDisclaimer("educationalLong")}
    </div>
  );
}

function CopyrightSection() {
  const t = useTranslations("footer");

  return (
    <div className="flex items-end justify-between gap-4 border-t border-outline-variant pt-4 text-label-md text-on-surface-variant lg:border-t-0 lg:pt-0">
      <span suppressHydrationWarning>© {new Date().getFullYear()} Health Made Clear.</span>
      <span>{t("rights")}</span>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="no-print px-3 pb-4 pt-8 md:px-4 md:pb-5">
      <div className="mx-auto max-w-container">
        <div className="surface-card-glass overflow-hidden px-6 py-8 md:px-8 md:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.45fr_0.9fr_0.9fr]">
            <AboutSection />
            <PlatformLinks />
            <LegalLinks />
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <DisclaimerSection />
            <CopyrightSection />
          </div>
        </div>
      </div>
    </footer>
  );
}
