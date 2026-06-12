"use client";

import { useTranslations } from "next-intl";
import PageSection from "@/components/PageSection";

export default function TermsClient() {
  const t = useTranslations("terms");

  return (
    <div className="py-16 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-headline-xl text-primary">{t("title")}</h1>
          <p className="mb-12 text-label-md text-on-surface-variant">{t("lastUpdated")}: June 1, 2026</p>

          {/* Medical Disclaimer — prominent */}
          <div className="mb-12 rounded-2xl border-2 border-error/30 bg-error-container/20 p-6">
            <h2 className="mb-3 text-headline-md text-on-error-container">{t("disclaimerTitle")}</h2>
            <p className="text-body-md text-on-error-container">{t("disclaimerBody")}</p>
          </div>

          <nav className="mb-12 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-label-lg font-semibold text-on-surface">{t("tableOfContents")}</h2>
            <ul className="space-y-2 text-body-md">
              {sections.map((s) => (
                <li key={s.key}>
                  <a href={`#${s.key}`} className="text-primary underline-offset-2 hover:underline">
                    {t(`${s.key}Title`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {sections.map((s) => (
            <PageSection key={s.key} id={s.key} title={t(`${s.key}Title`)}>
              <div className="space-y-4 text-body-md text-on-surface-variant">
                {Array.isArray(t.raw(`${s.key}Body`)) ? (
                  (t.raw(`${s.key}Body`) as string[]).map((para: string, i: number) => <p key={i}>{para}</p>)
                ) : (
                  <p>{t.raw(`${s.key}Body`)}</p>
                )}
              </div>
            </PageSection>
          ))}
        </div>
      </div>
    </div>
  );
}

const sections = [
  { key: "acceptance" },
  { key: "service" },
  { key: "accounts" },
  { key: "prohibited" },
  { key: "intellectual" },
  { key: "liability" },
  { key: "changes" },
  { key: "contact" },
];
