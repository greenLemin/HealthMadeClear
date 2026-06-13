import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { getAllGlossaryTerms } from "@/lib/glossary/loadGlossary";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import type { GlossaryTerm } from "@/types/glossary";
import GlossaryClient from "./GlossaryClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "glossary" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function GlossaryPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  const terms = getAllGlossaryTerms(locale);
  const base = getSiteUrl();

  return (
    <>
      <JsonLd
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
      <GlossaryClient terms={terms} />
    </>
  );
}
