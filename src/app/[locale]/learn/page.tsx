import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import LearnClient from "./LearnClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const t = await getTranslations({ locale, namespace: "learn" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function LearnPage({ params }: Props) {
  setRequestLocale(requireLocale(params.locale));
  return <LearnClient />;
}
