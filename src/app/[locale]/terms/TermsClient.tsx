"use client";

import { useTranslations } from "next-intl";
import PageHeader from "@/components/PageHeader";
import PageSection from "@/components/PageSection";
import Reveal from "@/components/ui/Reveal";

export default function TermsClient() {
  const t = useTranslations("terms");

  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <PageHeader
          title={t("title")}
          description={`${t("lastUpdated")}: June 1, 2026`}
          className="mx-auto max-w-5xl"
        />

        <div className="mx-auto mt-8 grid max-w-5xl gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Reveal>
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav className="surface-card-glass px-5 py-5 md:px-6" aria-label={t("tableOfContents")}>
                <h2 className="mb-4 font-display text-headline-sm text-primary">{t("tableOfContents")}</h2>
                <ul className="space-y-2 text-body-md">
                  {sections.map((s, index) => (
                    <li key={s.key}>
                      <a
                        href={`#${s.key}`}
                        className="flex items-center gap-3 text-primary transition-colors hover:text-primary-container"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-label-md font-semibold text-primary">
                          {index + 1}
                        </span>
                        <span>{t(`${s.key}Title`)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <div className="rounded-[1.6rem] border border-error/30 bg-error-container/25 px-6 py-6 md:px-8">
                <div className="eyebrow mb-3 text-on-error-container">{t("disclaimerTitle")}</div>
                <h2 className="font-display text-headline-md text-on-error-container">
                  {t("disclaimerTitle")}
                </h2>
                <p className="mt-3 text-body-md text-on-error-container">{t("disclaimerBody")}</p>
              </div>
            </Reveal>

            {sections.map((s, index) => (
              <Reveal key={s.key} delay={Math.min(index * 0.03, 0.18)}>
                <PageSection id={s.key} title={t(`${s.key}Title`)} eyebrow={`${index + 1}`}>
                  <div className="space-y-4 text-body-md text-on-surface-variant">
                    {Array.isArray(t.raw(`${s.key}Body`)) ? (
                      (t.raw(`${s.key}Body`) as string[]).map((para: string, i: number) => (
                        <p key={i}>{para}</p>
                      ))
                    ) : (
                      <p>{t.raw(`${s.key}Body`)}</p>
                    )}
                  </div>
                </PageSection>
              </Reveal>
            ))}
          </div>
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
