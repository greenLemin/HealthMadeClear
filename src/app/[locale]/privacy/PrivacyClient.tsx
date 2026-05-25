"use client";

import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";

export default function PrivacyClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={copy.privacy.title} description={copy.privacy.description} />

        <div className="mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.privacy.educationTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{copy.privacy.educationBody}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.privacy.collectTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{copy.privacy.collectBody}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.privacy.controlTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{copy.privacy.controlBody}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
