import { getTranslations } from "next-intl/server";
import ContactClient from "./ContactClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "contact" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
