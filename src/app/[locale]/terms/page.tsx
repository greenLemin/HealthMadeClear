import { getTranslations } from "next-intl/server";
import TermsClient from "./TermsClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "terms" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function TermsPage() {
  return <TermsClient />;
}
