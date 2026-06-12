import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { articles } from "@/data/articles";
import { requireLocale } from "@/lib/locale";
import { getArticleById } from "@/lib/localizedContent";
import JsonLd from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";
import ArticlePageClient from "./ArticlePageClient";

type Props = { params: { locale: string; slug: string } };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.id })));
}

export function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const article = getArticleById(params.slug, locale);
  if (!article) return { title: "Article not found" };
  const base = getSiteUrl();
  const path = `/articles/${article.id}`;
  const ogTitle = encodeURIComponent(article.title);
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `${base}/${locale}${path}`,
      languages: {
        en: `${base}/en${path}`,
        es: `${base}/es${path}`,
        "x-default": `${base}/en${path}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${base}/${locale}${path}`,
      images: [
        {
          url: `${base}/api/og?title=${ogTitle}&category=Articles`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [`${base}/api/og?title=${ogTitle}&category=Articles`],
    },
  };
}

export default function ArticleDetailPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  setRequestLocale(locale);
  const article = getArticleById(params.slug, locale);
  if (!article) notFound();

  const url = `${getSiteUrl()}/${locale}/articles/${article.id}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          inLanguage: locale,
          url,
          dateModified: article.lastReviewed,
        }}
      />
      <ArticlePageClient article={article} />
    </>
  );
}
