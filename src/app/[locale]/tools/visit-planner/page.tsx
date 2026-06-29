import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
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

export default function VisitPlannerPage() {
  return <VisitPlannerClient />;
}
