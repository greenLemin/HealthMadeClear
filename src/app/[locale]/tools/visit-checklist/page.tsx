import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
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

export default function VisitChecklistPage() {
  return <VisitChecklistClient />;
}
