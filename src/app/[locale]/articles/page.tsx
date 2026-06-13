import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import ArticlesClient from "./ArticlesClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  const base = getSiteUrl();
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${base}/${locale}/articles`,
      languages: { en: `${base}/en/articles`, es: `${base}/es/articles`, "x-default": `${base}/en/articles` },
    },
  };
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ArticlesClient />;
}
