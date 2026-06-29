import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import CareGuideClient from "./CareGuideClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("careGuideTitle"),
    description: t("careGuideDescription"),
    alternates: localeAlternates(locale, "/tools/care-guide"),
  };
}

export default function CareGuidePage() {
  return <CareGuideClient />;
}
