import { getTranslations } from "next-intl/server";
import VisitPlannerClient from "./VisitPlannerClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("plannerTitle"),
    description: t("plannerDescription"),
  };
}

export default function VisitPlannerPage() {
  return <VisitPlannerClient />;
}
