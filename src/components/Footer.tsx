"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tDisclaimer = useTranslations("disclaimer");

  return (
    <footer className="no-print border-t border-outline-variant bg-primary text-on-primary">
      <div className="max-w-container mx-auto px-4 py-12 md:px-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="mb-3 text-headline-md text-on-primary font-bold">Health Made Clear</p>
            <p className="max-w-md text-body-md text-on-primary/80">{t("tagline")}</p>
          </div>
          <div>
            <p className="mb-3 text-label-md text-on-primary font-semibold">{t("platform")}</p>
            <div className="space-y-2 text-body-md text-on-primary/80">
              <div>
                <Link href="/about" className="hover:text-on-primary transition-colors">
                  {tNav("about")}
                </Link>
              </div>
              <div>
                <Link href="/learning-paths" className="hover:text-on-primary transition-colors">
                  {tNav("paths")}
                </Link>
              </div>
              <div>
                <Link href="/tools" className="hover:text-on-primary transition-colors">
                  {tNav("tools")}
                </Link>
              </div>
              <div>
                <Link href="/glossary" className="hover:text-on-primary transition-colors">
                  {tNav("glossary")}
                </Link>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-3 text-label-md text-on-primary font-semibold">{t("legal")}</p>
            <div className="space-y-2 text-body-md text-on-primary/80">
              <div>
                <Link href="/accessibility" className="hover:text-on-primary transition-colors">
                  {t("accessibility")}
                </Link>
              </div>
              <div>
                <Link href="/privacy" className="hover:text-on-primary transition-colors">
                  {t("privacy")}
                </Link>
              </div>
              <div>
                <Link href="/terms" className="hover:text-on-primary transition-colors">
                  {t("terms")}
                </Link>
              </div>
              <div>
                <Link href="/contact" className="hover:text-on-primary transition-colors">
                  {t("contact")}
                </Link>
              </div>
            </div>
          </div>
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
