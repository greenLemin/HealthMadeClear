"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tDisclaimer = useTranslations("disclaimer");

  return (
    <footer className="no-print border-t border-outline-variant bg-primary dark:bg-surface-container-low text-on-primary dark:text-on-surface">
      <div className="max-w-container mx-auto px-4 py-12 md:px-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="mb-3 text-headline-md text-on-primary font-bold">Health Made Clear</p>
            <p className="max-w-md text-body-md text-on-primary/80">{t("tagline")}</p>
          </div>
          <nav aria-label={t("platform")}>
            <p className="mb-3 text-label-md text-on-primary font-semibold">{t("platform")}</p>
            <ul className="space-y-2 text-body-md text-on-primary/80">
              <li>
                <Link
                  href="/about"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/learning-paths"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {tNav("paths")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tools"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {tNav("tools")}
                </Link>
              </li>
              <li>
                <Link
                  href="/glossary"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {tNav("glossary")}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t("legal")}>
            <p className="mb-3 text-label-md text-on-primary font-semibold">{t("legal")}</p>
            <ul className="space-y-2 text-body-md text-on-primary/80">
              <li>
                <Link
                  href="/accessibility"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {t("accessibility")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="underline underline-offset-2 hover:text-on-primary transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="mt-8 rounded-2xl bg-primary-container/20 p-4 text-label-md text-on-primary/80">
          {tDisclaimer("educationalLong")}
        </div>
        <div className="mt-8 border-t border-on-primary/20 pt-6 text-label-md text-on-primary/70">
          © {new Date().getFullYear()} Health Made Clear. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
