import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import AccessibilityClient from "./AccessibilityClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessibility" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: localeAlternates(locale, "/accessibility"),
  };
}

export default function AccessibilityPage() {
  return <AccessibilityClient />;
}
