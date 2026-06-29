import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { getAllGlossaryTerms } from "@/lib/glossary/loadGlossary";
import { toLessonListItems } from "@/lib/lessonListItem";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import LearningPathsClient from "./LearningPathsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paths" });
  const tLearn = await getTranslations({ locale, namespace: "learn" });
  return {
    title: t("pageTitle"),
    description: tLearn("description"),
    alternates: localeAlternates(locale, "/learning-paths"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function LearningPathsPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  const lessons = toLessonListItems(getAllLessons(locale));
  const learningPaths = getAllLearningPaths(locale);
  const glossaryTerms = getAllGlossaryTerms(locale);
  const base = getSiteUrl();
  const t = await getTranslations({ locale, namespace: "paths" });

  return (
    <>
      <JsonLd
        id={`jsonld-paths-${locale}`}
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("pageTitle"),
          url: `${base}/${locale}/learning-paths`,
          itemListElement: learningPaths.map((path, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: path.title,
            url: `${base}/${locale}/learning-paths/${path.id}`,
          })),
        }}
      />
      <LearningPathsClient lessons={lessons} learningPaths={learningPaths} glossaryTerms={glossaryTerms} />
    </>
  );
}
