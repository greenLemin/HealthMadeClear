"use client";

import { Link } from "@/i18n/navigation";
import { BookOpen, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Callout from "@/components/Callout";
import { useTranslations } from "next-intl";

export default function AboutClient() {
  const t = useTranslations("about");

  const values = [
    { title: t("valueEducationTitle"), description: t("valueEducationBody"), icon: ShieldCheck },
    { title: t("valueEveryoneTitle"), description: t("valueEveryoneBody"), icon: Users },
    { title: t("valueStructuredTitle"), description: t("valueStructuredBody"), icon: BookOpen },
  ];

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")} />

        <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Callout type="info" title={t("valueEducationTitle")}>
            <div className="space-y-4">
              <p>{t("educationDetail")}</p>
              <p>{t("warningBody")}</p>
            </div>
          </Callout>
          <Callout type="success" title={t("whyMattersTitle")}>
            <p>{t("whyMattersBody")}</p>
          </Callout>
        </div>

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <article key={value.title} className="card">
                <div
                  className="mb-4 inline-flex rounded-lg bg-surface-container px-4 py-4 text-primary"
                  aria-hidden="true"
                >
                  <Icon size={22} />
                </div>
                <h2 className="mb-3 text-headline-md text-primary">{value.title}</h2>
                <p className="text-body-md text-on-surface-variant">{value.description}</p>
              </article>
            );
          })}
        </div>

        <section className="rounded-2xl bg-surface-container-low p-8 text-center">
          <div className="mb-4 inline-flex rounded-full bg-primary-fixed px-4 py-2 text-label-md font-semibold text-primary">
            {t("joinBadge")}
          </div>
          <h2 className="mb-4 text-headline-lg text-primary">{t("joinTitle")}</h2>
          <p className="mx-auto mb-8 max-w-3xl text-body-md text-on-surface-variant">{t("joinBody")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
              <HeartHandshake size={18} />
              {t("exploreLibrary")}
            </Link>
            <Link href="/tools" className="btn-secondary inline-flex items-center gap-2">
              {t("learnWithTools")}
            </Link>
          </div>
        </section>

        <section className="mt-12 text-center" id="contact">
          <h2 className="mb-2 text-headline-md text-primary">{t("contactTitle")}</h2>
          <p className="text-body-md text-on-surface-variant">
            {t("contactBody")}{" "}
            <a
              href="mailto:hello@healthmadeclear.org"
              className="font-semibold text-primary underline underline-offset-2"
            >
              hello@healthmadeclear.org
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
