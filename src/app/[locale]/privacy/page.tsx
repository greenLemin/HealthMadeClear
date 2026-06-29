import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import PrivacyClient from "./PrivacyClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/privacy"),
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
