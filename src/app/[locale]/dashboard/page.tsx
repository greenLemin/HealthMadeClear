import { getTranslations } from "next-intl/server";
import DashboardClient from "./DashboardClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "dashboard" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function Dashboard() {
  return <DashboardClient />;
}
