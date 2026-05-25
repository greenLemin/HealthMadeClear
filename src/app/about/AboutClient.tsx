"use client";

import Link from "next/link";
import { BookOpen, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import Callout from "@/components/Callout";
import { getMessages } from "@/lib/i18n";

export default function AboutClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  const values = [
    { title: copy.about.valueEducationTitle, description: copy.about.valueEducationBody, icon: ShieldCheck },
    { title: copy.about.valueEveryoneTitle, description: copy.about.valueEveryoneBody, icon: Users },
    { title: copy.about.valueStructuredTitle, description: copy.about.valueStructuredBody, icon: BookOpen },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={copy.about.title} description={copy.about.description} />

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Callout type="info" title={copy.about.valueEducationTitle}>
            <div className="space-y-4">
              <p>{copy.about.educationDetail}</p>
              <p>{copy.about.warningBody}</p>
            </div>
          </Callout>
          <Callout type="success" title={copy.about.whyMattersTitle}>
            <p>{copy.about.whyMattersBody}</p>
          </Callout>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="card">
                <div className="mb-4 inline-flex rounded-lg bg-surface-container px-4 py-4 text-primary">
                  <Icon size={22} />
                </div>
                <h2 className="mb-3 text-headline-md text-primary">{value.title}</h2>
                <p className="text-body-md text-on-surface-variant">{value.description}</p>
              </article>
            );
          })}
        </div>

        <section className="rounded-2xl bg-surface-container-low p-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-primary-fixed px-4 py-2 text-sm font-semibold text-primary">
            {copy.about.joinBadge}
          </div>
          <h2 className="mb-4 text-headline-lg text-primary">{copy.about.joinTitle}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-body-md text-on-surface-variant">{copy.about.joinBody}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
              <HeartHandshake size={18} />
              {copy.about.exploreLibrary}
            </Link>
            <Link href="/tools" className="btn-secondary inline-flex items-center gap-2">
              {copy.about.learnWithTools}
            </Link>
          </div>
        </section>

        <section className="mt-12 text-center" id="contact">
          <h2 className="mb-2 text-headline-md text-primary">{copy.about.contactTitle}</h2>
          <p className="text-body-md text-on-surface-variant">
            {copy.about.contactBody}{" "}
            <a href="mailto:hello@healthmadeclear.org" className="font-semibold text-primary">
              hello@healthmadeclear.org
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
