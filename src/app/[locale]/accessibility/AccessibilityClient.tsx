"use client";

import PageHeader from "@/components/PageHeader";
import ButtonLink from "@/components/ui/ButtonLink";
import Reveal from "@/components/ui/Reveal";
import { Link } from "@/i18n/navigation";
import { Eye, Keyboard, MessageSquareWarning, Send } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AccessibilityClient() {
  const t = useTranslations("accessibility");
  const tNav = useTranslations("nav");
  const features = t("featuresList")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const sections = [
    { title: t("commitmentTitle"), body: t("commitmentBody"), icon: Eye },
    { title: t("featuresTitle"), body: t("featuresList"), icon: Keyboard },
    { title: t("limitsTitle"), body: t("limitsBody"), icon: MessageSquareWarning },
  ];

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("pageTitle")} description={t("pageDescription")} className="mb-8" />

        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-5 md:grid-cols-3">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Reveal key={section.title} delay={Math.min(index * 0.05, 0.15)}>
                  <section className="surface-card px-6 py-6 md:px-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-primary shadow-elevation-1">
                      <Icon size={18} />
                    </div>
                    <h2 className="mt-4 font-display text-headline-sm text-primary">{section.title}</h2>
                    <p className="mt-3 text-body-md text-on-surface-variant">{section.body}</p>
                  </section>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={0.1}>
            <section className="surface-card-muted px-6 py-6 md:px-8">
              <div className="eyebrow mb-3">{t("featuresTitle")}</div>
              <div className="flex flex-wrap gap-3">
                {features.map((feature) => (
                  <span key={feature} className="chip">
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={0.14}>
            <section className="surface-card-glass px-6 py-6 md:px-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="eyebrow mb-3">{t("contactTitle")}</div>
                  <p className="max-w-2xl text-body-md text-on-surface-variant">
                    {t("contactBody")}{" "}
                    <Link
                      href="/about#contact"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      {tNav("about")}
                    </Link>
                  </p>
                </div>
                <ButtonLink href="/about#contact" icon={<Send size={18} />}>
                  {tNav("about")}
                </ButtonLink>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
