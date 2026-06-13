import { getTranslations } from "next-intl/server";
import VisitChecklistClient from "./VisitChecklistClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("checklistPageTitle"),
    description: t("checklistPageDescription"),
  };
}

export default function VisitChecklistPage() {
  return <VisitChecklistClient />;
}
