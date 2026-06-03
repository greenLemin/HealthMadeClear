import { getTranslations } from "next-intl/server";
import PrivacyClient from "./PrivacyClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "privacy" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function PrivacyPage() {
  return <PrivacyClient />;
}
