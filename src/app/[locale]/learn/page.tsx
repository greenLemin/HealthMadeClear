import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { toLessonListItems } from "@/lib/lessonListItem";
import LearnClient from "./LearnClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const t = await getTranslations({ locale, namespace: "learn" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function LearnPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  setRequestLocale(locale);
  const lessons = toLessonListItems(getAllLessons(locale));
  return <LearnClient lessons={lessons} />;
}
