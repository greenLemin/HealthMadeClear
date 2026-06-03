import { getTranslations } from "next-intl/server";
import LearnClient from "./LearnClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "learn" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function LearnPage() {
  return <LearnClient />;
}
