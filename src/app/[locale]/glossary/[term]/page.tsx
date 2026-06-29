import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { getGlossaryTerms } from "@/lib/localizedContent";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import GlossaryTermClient from "./GlossaryTermClient";

type Props = { params: Promise<{ locale: string; term: string }> };

export function generateStaticParams() {
  const enTerms = getGlossaryTerms("en");
  return routing.locales.flatMap((locale) => enTerms.map((term) => ({ locale, term: term.id })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, term: termId } = await params;
  const term = getGlossaryTerms(requireLocale(locale)).find((item) => item.id === termId);
  if (!term) return { title: "Term not found" };

  const base = getSiteUrl();
  const path = `/glossary/${term.id}`;

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
  };
}

export default async function GlossaryTermPage({ params }: Props) {
  const { locale, term: termId } = await params;
  const term = getGlossaryTerms(requireLocale(locale)).find((item) => item.id === termId);
  if (!term) notFound();

  const base = getSiteUrl();

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
      <GlossaryTermClient term={term} />
    </>
  );
}
