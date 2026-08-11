import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import { requireLocale } from "@/lib/locale";
import VisitChecklistClient from "./VisitChecklistClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("checklistPageTitle"),
    description: t("checklistPageDescription"),
    alternates: localeAlternates(locale, "/tools/visit-checklist"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function VisitChecklistPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  return <VisitChecklistClient />;
}
