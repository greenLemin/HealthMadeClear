import { getTranslations } from "next-intl/server";
import ToolsClient from "./ToolsClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "tools" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default function ToolsPage() {
  return <ToolsClient />;
}
