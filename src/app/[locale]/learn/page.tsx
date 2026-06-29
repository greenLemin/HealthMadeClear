import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { toLessonListItems } from "@/lib/lessonListItem";
import { localeAlternates } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import LearnClient from "./LearnClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "learn" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/learn"),
  };
}

export default async function LearnPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  const lessons = toLessonListItems(getAllLessons(locale));
  const base = getSiteUrl();
  const t = await getTranslations({ locale, namespace: "learn" });

  return (
    <>
      <JsonLd
        id={`jsonld-learn-${locale}`}
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: t("title"),
          url: `${base}/${locale}/learn`,
          itemListElement: lessons.map((lesson, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: lesson.title,
            url: `${base}/${locale}/learn/${lesson.id}`,
          })),
        }}
      />
      <LearnClient lessons={lessons} />
    </>
  );
}
