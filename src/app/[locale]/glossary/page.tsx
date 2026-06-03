import { getTranslations } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { getGlossaryTerms } from "@/lib/localizedContent";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import GlossaryClient from "./GlossaryClient";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "glossary" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

type Props = { params: { locale: string } };

export default function GlossaryPage({ params }: Props) {
  const locale = requireLocale(params.locale);
  const terms = getGlossaryTerms(locale);
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
      <GlossaryClient />
    </>
  );
}
