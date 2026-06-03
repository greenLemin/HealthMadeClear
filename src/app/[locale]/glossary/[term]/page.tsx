import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { getGlossaryTerms } from "@/lib/localizedContent";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import GlossaryTermClient from "./GlossaryTermClient";

type Props = { params: { locale: string; term: string } };

export function generateStaticParams() {
  const enTerms = getGlossaryTerms("en");
  return routing.locales.flatMap((locale) => enTerms.map((term) => ({ locale, term: term.id })));
}

export function generateMetadata({ params }: Props) {
  const locale = requireLocale(params.locale);
  const term = getGlossaryTerms(locale).find((item) => item.id === params.term);
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

export default function GlossaryTermPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  const term = getGlossaryTerms(locale).find((item) => item.id === params.term);
  if (!term) notFound();

  const base = getSiteUrl();

  return (
    <>
      <JsonLd
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
