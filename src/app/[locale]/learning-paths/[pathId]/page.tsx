import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { paths } from "@/data/paths";
import { requireLocale } from "@/lib/locale";
import { getPathById, getGlossaryTerms } from "@/lib/localizedContent";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import LearningPathDetailClient from "./LearningPathDetailClient";

type Props = { params: { locale: string; pathId: string } };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => paths.map((path) => ({ locale, pathId: path.id })));
}

export function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const path = getPathById(params.pathId, locale);
  if (!path) return { title: "Learning path not found" };
  return {
    title: `${path.title} — Learning Path`,
    description: path.description,
  };
}

export default function LearningPathDetailPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  const path = getPathById(params.pathId, locale);
  if (!path) notFound();

  const lessons = getAllLessons(locale);
  const glossaryTerms = getGlossaryTerms(locale);
  const url = `${getSiteUrl()}/${locale}/learning-paths/${path.id}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: path.title,
          description: path.description,
          inLanguage: locale,
          url,
          learningResourceType: "LearningPath",
          educationalLevel: path.level,
        }}
      />
      <LearningPathDetailClient path={path} lessons={lessons} glossaryTerms={glossaryTerms} />
    </>
  );
}
