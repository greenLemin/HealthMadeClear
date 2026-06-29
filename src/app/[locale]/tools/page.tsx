import { getTranslations } from "next-intl/server";
import { localeAlternates } from "@/lib/metadata";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import ToolsClient from "./ToolsClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tools" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: localeAlternates(locale, "/tools"),
  };
}

type Props = { params: Promise<{ locale: string }> };

export default async function ToolsPage({ params }: Props) {
  const { locale: localeStr } = await params;
  const locale = requireLocale(localeStr);
  const base = getSiteUrl();
  const t = await getTranslations({ locale, namespace: "tools" });

  const toolItems = [
    { name: t("askTitle"), url: `${base}/${locale}/tools/visit-planner` },
    { name: t("careTitle"), url: `${base}/${locale}/tools/care-guide` },
    { name: t("labelsTitle"), url: `${base}/${locale}/learn/understanding-prescription-labels` },
    { name: t("checklistTitle"), url: `${base}/${locale}/tools/visit-checklist` },
  ];

  return (
    <>
      <JsonLd
        id={`jsonld-tools-${locale}`}
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: t("pageTitle"),
          description: t("pageDescription"),
          url: `${base}/${locale}/tools`,
          hasPart: toolItems.map((tool) => ({
            "@type": "WebPage",
            name: tool.name,
            url: tool.url,
          })),
        }}
      />
      <ToolsClient />
    </>
  );
}
