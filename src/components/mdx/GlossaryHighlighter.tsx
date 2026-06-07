import { useMemo } from "react";
import InlineGlossaryTerm from "./InlineGlossaryTerm";
import type { GlossaryTerm } from "@/types/glossary";

interface GlossaryHighlighterProps {
  text: string;
  glossaryTerms: GlossaryTerm[];
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let instanceCounter = 0;

export default function GlossaryHighlighter({ text, glossaryTerms }: GlossaryHighlighterProps) {
  const parsedContent = useMemo(() => {
    if (!text || glossaryTerms.length === 0) return [text];

    instanceCounter = 0;

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
        const instanceId = `glossary-term-${instanceCounter++}`;
        return (
          <InlineGlossaryTerm
            key={`${termObj.id}-${index}`}
            term={{ id: termObj.id, term: termObj.term, definition: termObj.definition }}
            displayText={part}
            instanceId={instanceId}
          />
        );
      }
      return part;
    });
  }, [text, glossaryTerms]);

  return <>{parsedContent}</>;
}
