import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import LoginForm from "./LoginForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
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
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col justify-center">
          <h1 className="text-headline-lg md:text-headline-xl text-primary">{t("loginTitle")}</h1>
          <p className="mt-4 text-body-md text-on-surface-variant">{t("loginSubtitle")}</p>
          <div className="mt-8 rounded-2xl bg-secondary-container/30 p-6">
            <p className="text-body-md text-on-secondary-container">{t("missionMessage")}</p>
          </div>
        </div>

        <div>
          <Suspense
            fallback={
              <div className="space-y-4 animate-pulse" aria-hidden="true">
                <div className="h-14 rounded-lg bg-surface-container-high" />
                <div className="h-14 rounded-lg bg-surface-container-high" />
                <div className="h-14 rounded-lg bg-surface-container-high" />
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
