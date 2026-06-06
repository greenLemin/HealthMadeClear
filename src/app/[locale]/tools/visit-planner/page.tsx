import { getTranslations } from "next-intl/server";
import VisitPlannerClient from "./VisitPlannerClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "tools" });
  return {
    title: t("plannerTitle"),
    description: t("plannerDescription"),
  };
}

export default function VisitPlannerPage() {
  return <VisitPlannerClient />;
}
