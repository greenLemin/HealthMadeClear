"use client";

import React, { useMemo } from "react";
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
  const glossaryTerms = getGlossaryTerms(locale);

  const parsedContent = useMemo(() => {
    if (!text || glossaryTerms.length === 0) return [text];

    // Sort terms by length desc to match longer terms first (e.g. "blood pressure" before "blood")
    const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);

    // Map terms to regex-friendly strings
    const termMap = new Map<string, string>();
    const patterns: string[] = [];

    for (const termObj of sortedTerms) {
      const termName = termObj.term;
      termMap.set(termName.toLowerCase(), termObj.id);
      patterns.push(escapeRegExp(termName));
    }

    // Match word boundaries (supporting unicode letters for Spanish accents)
    // Note: We use \b in regex, but to support Spanish characters we can match boundaries or use a simpler split
    const regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      const termId = termMap.get(lowerPart);

      if (termId) {
        return <InlineGlossaryTerm key={index} termId={termId} displayText={part} />;
      }
      return part;
    });
  }, [text, glossaryTerms]);

  return <>{parsedContent}</>;
}
