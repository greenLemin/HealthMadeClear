import { terms as enTerms } from "@/data/glossaryBundles.en";
import { terms as esTerms } from "@/data/glossaryBundles.es";
import type { GlossaryTerm } from "@/types/glossary";
import type { Locale } from "@/lib/i18n";

const glossaryByLocale: Record<Locale, GlossaryTerm[]> = {
  en: enTerms,
  es: esTerms,
};

const glossaryMapByLocale = {
  en: new Map<string, GlossaryTerm>(enTerms.map((term) => [term.id, term])),
  es: new Map<string, GlossaryTerm>(esTerms.map((term) => [term.id, term])),
};

export function getAllGlossaryTerms(locale: Locale): GlossaryTerm[] {
  return glossaryByLocale[locale];
}

export function getGlossaryTermById(id: string, locale: Locale): GlossaryTerm | undefined {
  return glossaryMapByLocale[locale].get(id);
}

export function getGlossaryLabelFromBundle(id: string, locale: Locale): string {
  return getGlossaryTermById(id, locale)?.term ?? id;
}
