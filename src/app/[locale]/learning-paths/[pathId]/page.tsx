import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { paths } from "@/data/paths";
import { requireLocale } from "@/lib/locale";
import { getPathById, getGlossaryTerms } from "@/lib/localizedContent";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import LearningPathDetailClient from "./LearningPathDetailClient";

type Props = { params: Promise<{ locale: string; pathId: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => paths.map((path) => ({ locale, pathId: path.id })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, pathId } = await params;
  const path = getPathById(pathId, requireLocale(locale));
  if (!path) return { title: "Learning path not found" };
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/${locale}/learning-paths/${path.id}`;
  return {
    title: `${path.title} — Learning Path`,
    description: path.description,
    openGraph: {
      type: "website" as const,
      url,
      title: `${path.title} — Learning Path`,
      description: path.description,
      siteName: "Health Made Clear",
      images: [{ url: "/og-default.png", width: 1200, height: 630, alt: "Health Made Clear" }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${path.title} — Learning Path`,
      description: path.description,
      images: ["/og-default.png"],
    },
  };
}

export default async function LearningPathDetailPage({ params }: Props) {
  const { locale, pathId } = await params;
  const l = requireLocale(locale);
  const path = getPathById(pathId, l);
  if (!path) notFound();

  const lessons = getAllLessons(l);
  const glossaryTerms = getGlossaryTerms(l);
  const url = `${getSiteUrl()}/${locale}/learning-paths/${path.id}`;

  return (
    <>
      <JsonLd
        id={`jsonld-path-${locale}-${path.id}`}
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
