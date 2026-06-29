import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { lessons } from "@/data/lessons";
import { requireLocale } from "@/lib/locale";
import { getLessonById, getGlossaryTerms } from "@/lib/localizedContent";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import JsonLd from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";
import LessonPageClient from "./LessonPageClient";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => lessons.map((lesson) => ({ locale, slug: lesson.id })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const lesson = getLessonById(slug, requireLocale(locale));
  if (!lesson) return { title: "Lesson not found" };

  const base = getSiteUrl();
  const path = `/learn/${lesson.id}`;
  const ogTitle = encodeURIComponent(lesson.title);
  const ogCategory = encodeURIComponent(lesson.category || "Health Education");

  return {
    title: lesson.title,
    description: lesson.description,
    alternates: {
      canonical: `${base}/${locale}${path}`,
      languages: {
        en: `${base}/en${path}`,
        es: `${base}/es${path}`,
        "x-default": `${base}/en${path}`,
      },
    },
    openGraph: {
      title: lesson.title,
      description: lesson.description,
      url: `${base}/${locale}${path}`,
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: `${base}/api/og?title=${ogTitle}&category=${ogCategory}`,
          width: 1200,
          height: 630,
          alt: lesson.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: lesson.title,
      description: lesson.description,
      images: [`${base}/api/og?title=${ogTitle}&category=${ogCategory}`],
    },
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const l = requireLocale(locale);
  const lesson = getLessonById(slug, l);
  if (!lesson) {
    notFound();
  }

  const base = getSiteUrl();
  const url = `${base}/${locale}/learn/${lesson.id}`;
  const glossaryTerms = getGlossaryTerms(l);
  const learningPaths = getAllLearningPaths(l);

  return (
    <>
      <JsonLd
        id={`jsonld-lesson-${locale}-${lesson.id}`}
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: lesson.title,
          description: lesson.description,
          author: { "@type": "Organization", name: "Health Made Clear" },
          publisher: {
            "@type": "Organization",
            name: "Health Made Clear",
            url: "https://healthmadeclear.com",
          },
          datePublished: lesson.publishedAt || lesson.lastReviewed,
          dateModified: lesson.updatedAt || lesson.lastReviewed,
          inLanguage: locale,
          url,
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        }}
      />
      <LessonPageClient lesson={lesson} glossaryTerms={glossaryTerms} learningPaths={learningPaths} />
    </>
  );
}
