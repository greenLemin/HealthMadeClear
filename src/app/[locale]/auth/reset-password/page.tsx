import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("resetPasswordTitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ResetPasswordPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ResetPasswordClient />;
}
