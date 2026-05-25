import { glossaryBundles } from "@/data/glossaryBundles";
import type { GlossaryTerm } from "@/types/glossary";

export type { GlossaryTerm } from "@/types/glossary";

/** English glossary terms (bundled from content/glossary/en/*.mdx). */
export const glossaryTerms: GlossaryTerm[] = glossaryBundles.en;
