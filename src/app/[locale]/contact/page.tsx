import { getTranslations, setRequestLocale } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import { requireLocale } from "@/lib/locale";
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

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  return <ContactClient />;
}
