import { useMemo, useId } from "react";
import InlineGlossaryTerm from "./InlineGlossaryTerm";
import type { GlossaryTerm } from "@/types/glossary";

interface GlossaryHighlighterProps {
  text: string;
  glossaryTerms: GlossaryTerm[];
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function GlossaryHighlighter({ text, glossaryTerms }: GlossaryHighlighterProps) {
  const baseId = useId();

  const parsedContent = useMemo(() => {
    if (!text || glossaryTerms.length === 0) return [text];

    const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);

    const termMap = new Map<string, (typeof glossaryTerms)[number]>();
    const patterns: string[] = [];

    for (const termObj of sortedTerms) {
      termMap.set(termObj.term.toLowerCase(), termObj);
      patterns.push(escapeRegExp(termObj.term));
    }

    const regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
    const parts = text.split(regex);

    let termIndex = 0;
    return parts.map((part, index) => {
      const termObj = termMap.get(part.toLowerCase());

      if (termObj) {
        const instanceId = `glossary-term-${baseId}-${termIndex++}`;
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
  }, [text, glossaryTerms, baseId]);

  return <>{parsedContent}</>;
}
