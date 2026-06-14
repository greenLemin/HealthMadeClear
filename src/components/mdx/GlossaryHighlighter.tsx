import { useMemo } from "react";
import InlineGlossaryTerm from "./InlineGlossaryTerm";
import type { GlossaryTerm } from "@/types/glossary";
import { getGlossaryRegexAndMap } from "@/lib/glossary/highlighterCache";

interface GlossaryHighlighterProps {
  text: string;
  glossaryTerms: GlossaryTerm[];
}

export default function GlossaryHighlighter({ text, glossaryTerms }: GlossaryHighlighterProps) {
  const parsedContent = useMemo(() => {
    if (!text || glossaryTerms.length === 0) return [text];

    const { termMap, regex } = getGlossaryRegexAndMap(glossaryTerms);
    const parts = text.split(regex);

    let termIndex = 0;
    return parts.map((part, index) => {
      const termObj = termMap.get(part.toLowerCase());

      if (termObj) {
        const instanceId = `glossary-term-${termIndex++}`;
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
