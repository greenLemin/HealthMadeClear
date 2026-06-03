import { getTranslations } from "next-intl/server";
import AboutClient from "./AboutClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
