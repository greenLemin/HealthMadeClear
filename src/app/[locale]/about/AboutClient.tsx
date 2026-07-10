"use client";

import { BookOpen, HeartHandshake, Mail, ShieldCheck, Users } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import Callout from "@/components/Callout";
import Reveal from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

export default function AboutClient() {
  const t = useTranslations("about");

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")} className="mb-8" />
        <EducationMission t={t} />
        <EducationCallouts t={t} />
        <CoreValues t={t} />
        <JoinCommunity t={t} />
        <ContactInfo t={t} />
      </div>
    </div>
  );
}

function EducationMission({ t }: { t: any }) {
  return (
    <Reveal>
      <div className="section-frame px-6 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="eyebrow mb-4">{t("valueEducationTitle")}</div>
          <h2 className="font-display text-headline-lg text-primary">{t("educationDetail")}</h2>
          <p className="mt-4 text-body-md text-on-surface-variant">{t("description")}</p>
        </div>
      </div>
    </Reveal>
  );
}

function EducationCallouts({ t }: { t: any }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <Reveal>
        <Callout type="info" title={t("valueEducationTitle")} className="h-full">
          <div className="space-y-4">
            <p>{t("educationDetail")}</p>
            <p>{t("warningBody")}</p>
          </div>
        </Callout>
      </Reveal>
      <Reveal delay={0.06}>
        <Callout type="success" title={t("whyMattersTitle")} className="h-full">
          <p>{t("whyMattersBody")}</p>
        </Callout>
      </Reveal>
    </div>
  );
}

function CoreValues({ t }: { t: any }) {
  const values = [
    { title: t("valueEducationTitle"), description: t("valueEducationBody"), icon: ShieldCheck },
    { title: t("valueEveryoneTitle"), description: t("valueEveryoneBody"), icon: Users },
    { title: t("valueStructuredTitle"), description: t("valueStructuredBody"), icon: BookOpen },
  ];

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-3">
      {values.map((value, index) => {
        const Icon = value.icon;
        return (
          <Reveal key={value.title} delay={Math.min(index * 0.05, 0.15)}>
            <article className="surface-card px-6 py-6 md:px-7">
              <div
                className="mb-4 inline-flex rounded-[1.1rem] bg-surface-container px-4 py-4 text-primary shadow-elevation-1"
                aria-hidden="true"
              >
                <Icon size={22} />
              </div>
              <h2 className="font-display text-headline-md text-primary">{value.title}</h2>
              <p className="mt-3 text-body-md text-on-surface-variant">{value.description}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

function JoinCommunity({ t }: { t: any }) {
  return (
    <Reveal delay={0.1} className="mt-12">
      <section className="surface-card-strong px-6 py-8 text-center md:px-10 md:py-10">
        <div className="mb-4 inline-flex rounded-full bg-primary-fixed px-4 py-2 text-label-md font-semibold text-primary">
          {t("joinBadge")}
        </div>
        <h2 className="font-display text-headline-lg text-primary">{t("joinTitle")}</h2>
        <p className="mx-auto mt-4 max-w-3xl text-body-md text-on-surface-variant">{t("joinBody")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/learn" icon={<HeartHandshake size={18} />}>
            {t("exploreLibrary")}
          </ButtonLink>
          <ButtonLink href="/tools" variant="secondary">
            {t("learnWithTools")}
          </ButtonLink>
        </div>
      </section>
    </Reveal>
  );
}

function ContactInfo({ t }: { t: any }) {
  return (
    <Reveal delay={0.14} className="mt-8">
      <section className="surface-card-glass px-6 py-6 text-center md:px-8" id="contact">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-primary shadow-elevation-1">
          <Mail size={20} />
        </div>
        <h2 className="mt-4 font-display text-headline-md text-primary">{t("contactTitle")}</h2>
        <p className="mt-3 text-body-md text-on-surface-variant">
          {t("contactBody")}{" "}
          <a
            href="mailto:hello@healthmadeclear.org"
            className="font-semibold text-primary underline underline-offset-2"
          >
            hello@healthmadeclear.org
          </a>
        </p>
      </section>
    </Reveal>
  );
}
