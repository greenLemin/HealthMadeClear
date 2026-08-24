import { getTranslations, setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { getAllGlossaryTerms } from "@/lib/glossary/loadGlossary";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { requireLocale } from "@/lib/locale";
import { localeAlternates } from "@/lib/metadata";
import { getSiteUrl } from "@/lib/site";
import GlossaryClient from "./GlossaryClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: localeAlternates(locale, "/glossary"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function GlossaryPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  setRequestLocale(locale);
  const terms = getAllGlossaryTerms(locale);
  const base = getSiteUrl();
  const lessonTitles = Object.fromEntries(getAllLessons(locale).map((l) => [l.id, l.title]));
  const termLabels = Object.fromEntries(terms.map((term) => [term.id, term.term]));

  return (
    <>
      <JsonLd
        id={`jsonld-glossary-${locale}`}
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Health Glossary",
          url: `${base}/${locale}/glossary`,
          hasPart: terms.map((term) => ({
            "@type": "DefinedTerm",
            name: term.term,
            description: term.definition.slice(0, 200),
            url: `${base}/${locale}/glossary/${term.id}`,
          })),
        }}
      />
      <GlossaryClient terms={terms} lessonTitles={lessonTitles} termLabels={termLabels} />
    </>
  );
}
