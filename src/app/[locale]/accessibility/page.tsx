import { getTranslations } from "next-intl/server";
import AccessibilityClient from "./AccessibilityClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "accessibility" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function AccessibilityPage() {
  return <AccessibilityClient />;
}
