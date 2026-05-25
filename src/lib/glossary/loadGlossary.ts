import { glossaryBundles } from "@/data/glossaryBundles";
import type { GlossaryTerm } from "@/types/glossary";
import type { Locale } from "@/lib/i18n";

export function getAllGlossaryTerms(locale: Locale): GlossaryTerm[] {
  return glossaryBundles[locale];
}

export function getGlossaryTermById(id: string, locale: Locale): GlossaryTerm | undefined {
  return glossaryBundles[locale].find((term) => term.id === id);
}

export function getGlossaryLabelFromBundle(id: string, locale: Locale): string {
  return getGlossaryTermById(id, locale)?.term ?? id;
}
