import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import AboutClient from "./AboutClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/about"),
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
