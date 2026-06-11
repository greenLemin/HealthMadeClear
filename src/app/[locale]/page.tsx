import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import HomeClient from "./HomeClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const t = await getTranslations({ locale, namespace: "hero" });
  const base = getSiteUrl();

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
        es: `${base}/es`,
        "x-default": `${base}/en`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: `${base}/${locale}`,
    },
  };
}

export default function Home({ params }: Props) {
  setRequestLocale(requireLocale(params.locale));
  return <HomeClient />;
}
