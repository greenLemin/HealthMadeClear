import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import LoginForm from "./LoginForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("loginTitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "auth" });

  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
        <div className="surface-card-strong flex flex-col justify-center p-8 md:p-10">
          <div className="eyebrow mb-4">{t("loginButton")}</div>
          <h1 className="font-display text-headline-lg md:text-headline-xl text-primary">
            {t("loginTitle")}
          </h1>
          <p className="mt-4 max-w-readable text-body-md text-on-surface-variant">{t("loginSubtitle")}</p>
          <div className="surface-card mt-8 p-6">
            <p className="text-body-md text-on-surface-variant">{t("missionMessage")}</p>
          </div>
        </div>

        <div className="surface-card-glass p-6 md:p-8">
          <Suspense
            fallback={
              <div className="space-y-4 animate-pulse motion-reduce:animate-none" aria-hidden="true">
                <div className="h-14 rounded-2xl bg-surface-container-high" />
                <div className="h-14 rounded-2xl bg-surface-container-high" />
                <div className="h-14 rounded-2xl bg-surface-container-high" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
