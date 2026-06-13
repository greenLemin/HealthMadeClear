import { getTranslations } from "next-intl/server";
import ToolsClient from "./ToolsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function ToolsPage() {
  return <ToolsClient />;
}
