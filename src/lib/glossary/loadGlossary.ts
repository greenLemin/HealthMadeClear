import { glossaryBundles } from "@/data/glossaryBundles";
import type { GlossaryTerm } from "@/types/glossary";
import type { Locale } from "@/lib/i18n";

const glossaryMapByLocale = {
  en: new Map<string, GlossaryTerm>(glossaryBundles.en.map((term) => [term.id, term])),
  es: new Map<string, GlossaryTerm>(glossaryBundles.es.map((term) => [term.id, term])),
};

export function getAllGlossaryTerms(locale: Locale): GlossaryTerm[] {
  return glossaryBundles[locale];
}

export function getGlossaryTermById(id: string, locale: Locale): GlossaryTerm | undefined {
  return glossaryMapByLocale[locale].get(id);
}

export function getGlossaryLabelFromBundle(id: string, locale: Locale): string {
  return getGlossaryTermById(id, locale)?.term ?? id;
}
