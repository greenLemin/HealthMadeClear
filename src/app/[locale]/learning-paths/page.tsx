import { getTranslations } from "next-intl/server";
import LearningPathsClient from "./LearningPathsClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "paths" });
  return {
    title: t("pageTitle"),
    description: t("pageTitle"),
  };
}

export default function LearningPathsPage() {
  return <LearningPathsClient />;
}
