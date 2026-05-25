"use client";

import { Link } from "@/i18n/navigation";
import Hero from "@/components/Hero";
import SectionNav from "@/components/SectionNav";
import Callout from "@/components/Callout";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import { formatLevel, getMessages } from "@/lib/i18n";
import { getLearningPaths } from "@/lib/localizedContent";

export default function HomeClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);
  const learningPaths = getLearningPaths(locale);

  return (
    <main>
      <Hero />
      <SectionNav />

      <section className="pb-12">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <div className="mb-12 rounded-[28px] border border-outline-variant bg-surface p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary">
                  {copy.home.introBadge}
                </div>
                <h2 className="mb-2 text-headline-md text-primary">{copy.home.introTitle}</h2>
                <p className="text-body-md text-on-surface-variant">{copy.home.introBody}</p>
              </div>
              <Link href="/learning-paths" className="btn-primary inline-flex items-center justify-center">
                {copy.home.takeTour}
              </Link>
            </div>
          </div>

          <section className="mb-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-headline-lg text-primary">{copy.home.featuredPaths}</h2>
                <p className="text-body-md text-on-surface-variant">{copy.home.featuredPathsBody}</p>
              </div>
              <Link href="/learning-paths" className="text-sm font-semibold text-primary">
                {copy.home.viewAllPaths}
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {learningPaths.slice(0, 2).map((path) => (
                <Link
                  key={path.id}
                  href={`/learning-paths#${path.id}`}
                  className="group hover-lift rounded-[24px] border border-outline-variant bg-surface p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_42px_rgba(15,23,42,0.08)]"
                >
                  <div className="mb-3 inline-flex rounded-full bg-surface-container px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    {formatLevel(path.level, locale)}
                  </div>
                  <div className="mb-3 text-4xl" aria-hidden="true">
                    {path.icon}
                  </div>
                  <h3 className="mb-3 text-headline-md text-primary">{path.title}</h3>
                  <p className="mb-5 text-body-md text-on-surface-variant">{path.description}</p>
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span>
                      {path.lessons.length} {copy.common.modules}
                    </span>
                    <span>{path.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <Callout type="info" title={copy.disclaimer.educationalTitle} className="mb-8">
            <p>{copy.disclaimer.educationalLong}</p>
          </Callout>

          <MedicalDisclaimer locale={locale} variant="emergency" />
        </div>
      </section>
    </main>
  );
}
