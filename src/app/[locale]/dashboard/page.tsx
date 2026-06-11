import { getTranslations } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { toLessonListItems } from "@/lib/lessonListItem";
import DashboardClient from "./DashboardClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "dashboard" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { params: { locale: string } };

export default function Dashboard({ params }: Props) {
  const locale = requireLocale(params.locale);
  const lessons = toLessonListItems(getAllLessons(locale));
  const learningPaths = getAllLearningPaths(locale);
  return <DashboardClient lessons={lessons} learningPaths={learningPaths} />;
}
