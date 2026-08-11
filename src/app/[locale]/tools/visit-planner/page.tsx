import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import { requireLocale } from "@/lib/locale";
import VisitPlannerClient from "./VisitPlannerClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("plannerTitle"),
    description: t("plannerDescription"),
    alternates: localeAlternates(locale, "/tools/visit-planner"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function VisitPlannerPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  return <VisitPlannerClient />;
}
