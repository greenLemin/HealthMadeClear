"use client";

import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";

export default function AccessibilityClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={copy.accessibility.pageTitle} description={copy.accessibility.pageDescription} />

        <div className="mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.accessibility.commitmentTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{copy.accessibility.commitmentBody}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.accessibility.featuresTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{copy.accessibility.featuresList}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.accessibility.limitsTitle}</h2>
            <p className="text-body-md text-on-surface-variant">{copy.accessibility.limitsBody}</p>
          </section>
          <section>
            <h2 className="mb-3 text-headline-md text-primary">{copy.accessibility.contactTitle}</h2>
            <p className="text-body-md text-on-surface-variant">
              {copy.accessibility.contactBody}{" "}
              <a href="/about#contact" className="font-semibold text-primary">
                {copy.nav.about}
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
