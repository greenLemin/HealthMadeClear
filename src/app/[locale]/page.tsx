import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireLocale } from "@/lib/locale";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { getAllLearningPaths } from "@/lib/paths/loadPaths";
import { toLessonListItems } from "@/lib/lessonListItem";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import HomeClient from "./HomeClient";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
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

export default async function Home({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  const lessons = toLessonListItems(getAllLessons(locale));
  const learningPaths = getAllLearningPaths(locale);
  const base = getSiteUrl();
  return (
    <>
      <JsonLd
        id={`jsonld-home-${locale}`}
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Health Made Clear",
          url: `${base}/${locale}`,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${base}/${locale}/glossary?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <HomeClient lessons={lessons} learningPaths={learningPaths} />
    </>
  );
}
