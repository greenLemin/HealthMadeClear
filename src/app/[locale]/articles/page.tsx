import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllArticles } from "@/lib/articles/loadArticles";
import { getSiteUrl } from "@/lib/site";
import { localeAlternates } from "@/lib/metadata";
import JsonLd from "@/components/JsonLd";
import ArticlesClient from "./ArticlesClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  const base = getSiteUrl();
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/articles"),
  };
}

export default async function ArticlesPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  const articles = getAllArticles(locale);
  const base = getSiteUrl();
  const t = await getTranslations({ locale, namespace: "articles" });

  return (
    <>
      <JsonLd
        id={`jsonld-articles-${locale}`}
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("title"),
          url: `${base}/${locale}/articles`,
          itemListElement: articles.map((article, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: article.title,
            url: `${base}/${locale}/articles/${article.id}`,
          })),
        }}
      />
      <ArticlesClient />
    </>
  );
}
