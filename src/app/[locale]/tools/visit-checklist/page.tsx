import { getTranslations } from "next-intl/server";
import VisitChecklistClient from "./VisitChecklistClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "tools" });
  return {
    title: t("checklistPageTitle"),
    description: t("checklistPageDescription"),
  };
}

export default function VisitChecklistPage() {
  return <VisitChecklistClient />;
}
