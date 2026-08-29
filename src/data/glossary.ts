import { terms as enTerms } from "@/data/glossaryBundles.en";
import type { GlossaryTerm } from "@/types/glossary";

export type { GlossaryTerm } from "@/types/glossary";

/** English glossary terms (bundled from content/glossary/en/*.mdx). */
export const glossaryTerms: GlossaryTerm[] = enTerms;
