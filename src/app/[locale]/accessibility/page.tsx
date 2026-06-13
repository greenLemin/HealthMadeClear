import { getTranslations } from "next-intl/server";
import AccessibilityClient from "./AccessibilityClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessibility" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function AccessibilityPage() {
  return <AccessibilityClient />;
}
