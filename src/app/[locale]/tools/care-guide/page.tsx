import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import { requireLocale } from "@/lib/locale";
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

type Props = { params: Promise<{ locale: string }> };

export default async function CareGuidePage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  return <CareGuideClient />;
}
