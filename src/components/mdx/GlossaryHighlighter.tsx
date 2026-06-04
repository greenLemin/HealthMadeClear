"use client";

import { useMemo } from "react";
import { useAppState } from "@/components/AppProviders";
import { getGlossaryTerms } from "@/lib/localizedContent";
import InlineGlossaryTerm from "./InlineGlossaryTerm";

interface GlossaryHighlighterProps {
  text: string;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function GlossaryHighlighter({ text }: GlossaryHighlighterProps) {
  const { locale } = useAppState();
  // Fetch once per component instance — passed down to each InlineGlossaryTerm
  const glossaryTerms = useMemo(() => getGlossaryTerms(locale), [locale]);

  const parsedContent = useMemo(() => {
    if (!text || glossaryTerms.length === 0) return [text];

    // Sort terms by length desc to match longer terms first (e.g. "blood pressure" before "blood")
    const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);

    // Map lower-cased term name → term object for O(1) lookup
    const termMap = new Map<string, (typeof glossaryTerms)[number]>();
    const patterns: string[] = [];

    for (const termObj of sortedTerms) {
      termMap.set(termObj.term.toLowerCase(), termObj);
      patterns.push(escapeRegExp(termObj.term));
    }

    // Match word boundaries (supporting unicode letters for Spanish accents)
    const regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const termObj = termMap.get(part.toLowerCase());

      if (termObj) {
        return (
          <InlineGlossaryTerm
            key={`${termObj.id}-${index}`}
            term={termObj}
            displayText={part}
          />
        );
      }
      return part;
    });
  }, [text, glossaryTerms]);

  return <>{parsedContent}</>;
}
