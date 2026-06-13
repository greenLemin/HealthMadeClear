import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { getAllGlossaryTerms } from "@/lib/glossary/loadGlossary";
import { toLessonListItems } from "@/lib/lessonListItem";
import LearningPathsClient from "./LearningPathsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paths" });
  return {
    title: t("pageTitle"),
    description: t("pageTitle"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function LearningPathsPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  const lessons = toLessonListItems(getAllLessons(locale));
  const learningPaths = getAllLearningPaths(locale);
  const glossaryTerms = getAllGlossaryTerms(locale);
  return (
    <LearningPathsClient lessons={lessons} learningPaths={learningPaths} glossaryTerms={glossaryTerms} />
  );
}
