"use client";

import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";

export default function CareGuideClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  const careOptions = [
    { title: copy.tools.homeCare, description: copy.tools.homeCareBody, tone: "border-outline-variant bg-surface" },
    { title: copy.tools.primaryCare, description: copy.tools.primaryCareBody, tone: "border-outline-variant bg-secondary-container/40" },
    { title: copy.tools.urgentCare, description: copy.tools.urgentCareBody, tone: "border-transparent bg-secondary-container" },
    { title: copy.tools.emergency, description: copy.tools.emergencyBody, tone: "border-error bg-error-container" },
  ];

  return (
    <main className="pb-16">
      <div className="no-print bg-error px-4 py-3 text-center text-sm font-semibold text-on-error">
        {copy.disclaimer.emergencyBody}
      </div>
      <div className="max-w-container mx-auto px-4 py-12 md:px-6">
        <PageHeader centered title={copy.tools.careGuideTitle} description={copy.tools.careGuideDescription} />

        <section className="mb-12">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {careOptions.map((option) => (
              <article key={option.title} className={`rounded-lg border p-6 ${option.tone}`}>
                <h3 className="mb-3 text-headline-md text-primary">{option.title}</h3>
                <p className="text-body-md text-on-surface-variant">{option.description}</p>
              </article>
            ))}
          </div>
        </section>

        <MedicalDisclaimer locale={locale} variant="emergency" />
      </div>
    </main>
  );
}
