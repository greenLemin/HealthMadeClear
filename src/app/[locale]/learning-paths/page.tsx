import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { getAllGlossaryTerms } from "@/lib/glossary/loadGlossary";
import { toLessonListItems } from "@/lib/lessonListItem";
import LearningPathsClient from "./LearningPathsClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "paths" });
  return {
    title: t("pageTitle"),
    description: t("pageTitle"),
  };
}

type Props = { params: { locale: string } };

export default function LearningPathsPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  const lessons = toLessonListItems(getAllLessons(locale));
  const learningPaths = getAllLearningPaths(locale);
  const glossaryTerms = getAllGlossaryTerms(locale);
  return (
    <LearningPathsClient lessons={lessons} learningPaths={learningPaths} glossaryTerms={glossaryTerms} />
  );
}
