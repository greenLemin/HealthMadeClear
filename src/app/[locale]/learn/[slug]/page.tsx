import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { lessons } from "@/data/lessons";
import { requireLocale } from "@/lib/locale";
import { getLessonById, getGlossaryTerms } from "@/lib/localizedContent";
import JsonLd from "@/components/JsonLd";
import { getSiteUrl } from "@/lib/site";
import LessonPageClient from "./LessonPageClient";

type Props = { params: { locale: string; slug: string } };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => lessons.map((lesson) => ({ locale, slug: lesson.id })));
}

export function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const lesson = getLessonById(params.slug, locale);
  if (!lesson) return { title: "Lesson not found" };

  const base = getSiteUrl();
  const path = `/learn/${lesson.id}`;

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
    },
  };
}

export default function LessonDetailPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  const lesson = getLessonById(params.slug, locale);
  if (!lesson) {
    notFound();
  }

  const base = getSiteUrl();
  const url = `${base}/${locale}/learn/${lesson.id}`;
  const glossaryTerms = getGlossaryTerms(locale);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: lesson.title,
          description: lesson.description,
          inLanguage: locale,
          url,
          learningResourceType: "Lesson",
          educationalLevel: lesson.level,
          timeRequired: lesson.duration,
        }}
      />
      <LessonPageClient lesson={lesson} glossaryTerms={glossaryTerms} />
    </>
  );
}
