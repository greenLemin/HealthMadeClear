import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { articles } from "@/data/articles";
import { requireLocale } from "@/lib/locale";
import { getArticleById } from "@/lib/localizedContent";
import JsonLd from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";
import ArticlePageClient from "./ArticlePageClient";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.id })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const article = getArticleById(slug, requireLocale(locale));
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

export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const l = requireLocale(locale);
  setRequestLocale(l);
  const article = getArticleById(slug, l);
  if (!article) notFound();

  const url = `${getSiteUrl()}/${locale}/articles/${article.id}`;

  return (
    <>
      <JsonLd
        id={`jsonld-article-${locale}-${article.id}`}
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
