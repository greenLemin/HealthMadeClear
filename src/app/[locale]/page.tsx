import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { toLessonListItems } from "@/lib/lessonListItem";
import { getSiteUrl } from "@/lib/site";
import HomeClient from "./HomeClient";

type Props = { params: { locale: string } };

export async function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const t = await getTranslations({ locale, namespace: "hero" });
  const base = getSiteUrl();

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
        es: `${base}/es`,
        "x-default": `${base}/en`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url: `${base}/${locale}`,
    },
  };
}

export default function Home({ params }: Props) {
  const locale = requireLocale(params.locale);
  setRequestLocale(locale);
  const lessons = toLessonListItems(getAllLessons(locale));
  const learningPaths = getAllLearningPaths(locale);
  return <HomeClient lessons={lessons} learningPaths={learningPaths} />;
}
