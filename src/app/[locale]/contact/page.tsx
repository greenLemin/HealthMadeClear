import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import ContactClient from "./ContactClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/contact"),
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
