import { getTranslations } from "next-intl/server";
import TermsClient from "./TermsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "terms" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function TermsPage() {
  return <TermsClient />;
}
