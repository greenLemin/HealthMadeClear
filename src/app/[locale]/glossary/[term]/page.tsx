import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { getGlossaryTerms, getGlossaryTermById } from "@/lib/localizedContent";
import { getAllLessons } from "@/lib/lessons/loadLessons";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import GlossaryTermClient from "./GlossaryTermClient";

type Props = { params: Promise<{ locale: string; term: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((l) =>
    getGlossaryTerms(l as "en" | "es").map((t) => ({ locale: l, term: t.id }))
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, term: termId } = await params;
  const term = getGlossaryTermById(termId, requireLocale(locale));
  if (!term) return { title: "Term not found" };

  const base = getSiteUrl();
  const path = `/glossary/${term.id}`;
  const ogTitle = encodeURIComponent(term.term);
  const ogCategory = encodeURIComponent(term.category ?? "Glossary");

  return {
    title: term.term,
    description: term.definition.slice(0, 160),
    alternates: {
      canonical: `${base}/${locale}${path}`,
      languages: {
        en: `${base}/en${path}`,
        es: `${base}/es${path}`,
        "x-default": `${base}/en${path}`,
      },
    },
    openGraph: {
      title: term.term,
      description: term.definition.slice(0, 160),
      url: `${base}/${locale}${path}`,
      locale: locale === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: `${base}/api/og?title=${ogTitle}&category=${ogCategory}`,
          width: 1200,
          height: 630,
          alt: term.term,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: term.term,
      description: term.definition.slice(0, 160),
      images: [`${base}/api/og?title=${ogTitle}&category=${ogCategory}`],
    },
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { locale, term: termId } = await params;
  const l = requireLocale(locale);
  setRequestLocale(l);
  const term = getGlossaryTermById(termId, l);
  if (!term) notFound();

  const base = getSiteUrl();
  const glossaryTerms = getGlossaryTerms(l);
  const lessonTitles = Object.fromEntries(getAllLessons(l).map((lesson) => [lesson.id, lesson.title]));
  const termLabels = Object.fromEntries(glossaryTerms.map((t) => [t.id, t.term]));

  return (
    <>
      <JsonLd
        id={`jsonld-glossary-term-${locale}-${term.id}`}
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: term.term,
          description: term.definition.slice(0, 160),
          inLanguage: locale,
          url: `${base}/${locale}/glossary/${term.id}`,
        }}
      />
      <GlossaryTermClient
        term={term}
        glossaryTerms={glossaryTerms}
        lessonTitles={lessonTitles}
        termLabels={termLabels}
      />
    </>
  );
}
