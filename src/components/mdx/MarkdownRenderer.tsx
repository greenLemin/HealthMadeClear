"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import InlineGlossaryTerm from "./InlineGlossaryTerm";
import type { GlossaryTerm } from "@/types/glossary";

interface Token {
  type: string;
  tag?: string;
  attrs?: [string, string][];
  children?: Token[];
  content?: string;
  markup?: string;
  info?: string;
  meta?: Record<string, unknown>;
  block?: boolean;
  hidden?: boolean;
  level?: number;
  map?: [number, number] | null;
  nesting?: number;
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
});

interface MarkdownRendererProps {
  text: string;
  glossaryTerms: GlossaryTerm[];
}

function renderTokens(tokens: any[], glossaryTerms: GlossaryTerm[], index: number = 0): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let i = index;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "inline") {
      if (token.children) {
        for (const child of token.children) {
          if (child.type === "text" && child.content) {
            result.push(
              <GlossaryHighlighter
                key={`${i}-${child.content.slice(0, 20)}`}
                text={child.content}
                glossaryTerms={glossaryTerms}
              />
            );
          } else if (child.type === "strong_open" || child.type === "em_open") {
            // Handle nested inline elements - for simplicity, skip nested formatting for now
          }
        }
      }
    } else if (token.type === "paragraph_open") {
      const children: React.ReactNode[] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== "paragraph_close") {
        if (tokens[i].type === "inline") {
          const inlineChildren = renderTokens([tokens[i]], glossaryTerms);
          children.push(...inlineChildren);
        }
        i++;
      }
      result.push(<p key={`p-${i}`}>{children}</p>);
    } else if (token.type === "bullet_list_open") {
      const items: React.ReactNode[] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== "bullet_list_close") {
        if (tokens[i].type === "list_item_open") {
          const itemChildren: React.ReactNode[] = [];
          i++;
          while (i < tokens.length && tokens[i].type !== "list_item_close") {
            if (tokens[i].type === "paragraph_open") {
              const paraChildren: React.ReactNode[] = [];
              i++;
              while (i < tokens.length && tokens[i].type !== "paragraph_close") {
                if (tokens[i].type === "inline") {
                  paraChildren.push(...renderTokens([tokens[i]], glossaryTerms));
                }
                i++;
              }
              itemChildren.push(...paraChildren);
            }
            i++;
          }
          items.push(<li key={`li-${i}`}>{itemChildren}</li>);
        }
        i++;
      }
      result.push(<ul key={`ul-${i}`}>{items}</ul>);
    } else if (token.type === "ordered_list_open") {
      const items: React.ReactNode[] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== "ordered_list_close") {
        if (tokens[i].type === "list_item_open") {
          const itemChildren: React.ReactNode[] = [];
          i++;
          while (i < tokens.length && tokens[i].type !== "list_item_close") {
            if (tokens[i].type === "paragraph_open") {
              const paraChildren: React.ReactNode[] = [];
              i++;
              while (i < tokens.length && tokens[i].type !== "paragraph_close") {
                if (tokens[i].type === "inline") {
                  paraChildren.push(...renderTokens([tokens[i]], glossaryTerms));
                }
                i++;
              }
              itemChildren.push(...paraChildren);
            }
            i++;
          }
          items.push(<li key={`li-${i}`}>{itemChildren}</li>);
        }
        i++;
      }
      result.push(<ol key={`ol-${i}`}>{items}</ol>);
    } else if (token.type === "heading_open") {
      const level = parseInt(token.tag.slice(1), 10) || 2;
      const headingChildren: React.ReactNode[] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== "heading_close") {
        if (tokens[i].type === "inline") {
          headingChildren.push(...renderTokens([tokens[i]], glossaryTerms));
        }
        i++;
      }
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      result.push(<Tag key={`h${level}-${i}`}>{headingChildren}</Tag>);
    } else if (token.type === "link_open") {
      const href = token.attrGet("href") || "#";
      const linkChildren: React.ReactNode[] = [];
      i++;
      while (i < tokens.length && tokens[i].type !== "link_close") {
        if (tokens[i].type === "inline") {
          linkChildren.push(...renderTokens([tokens[i]], glossaryTerms));
        }
        i++;
      }
      result.push(
        <a
          key={`link-${i}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:no-underline"
        >
          {linkChildren}
        </a>
      );
    } else if (token.type === "strong_open" || token.type === "em_open") {
      // Inline formatting - handled by inline token children
    }

    i++;
  }

  return result;
}

function GlossaryHighlighter({ text, glossaryTerms }: { text: string; glossaryTerms: GlossaryTerm[] }) {
  if (!text || glossaryTerms.length === 0) return text;

  const sortedTerms = [...glossaryTerms].sort((a, b) => b.term.length - a.term.length);
  const termMap = new Map<string, GlossaryTerm>();
  const patterns: string[] = [];

  for (const termObj of sortedTerms) {
    termMap.set(termObj.term.toLowerCase(), termObj);
    patterns.push(termObj.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }

  const regex = new RegExp(`\\b(${patterns.join("|")})\\b`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const termObj = termMap.get(part.toLowerCase());
    if (termObj) {
      return (
        <InlineGlossaryTerm
          key={`${termObj.id}-${index}`}
          term={{ id: termObj.id, term: termObj.term, definition: termObj.definition }}
          displayText={part}
        />
      );
    }
    return part;
  });
}

export default function MarkdownRenderer({ text, glossaryTerms }: MarkdownRendererProps) {
  const tokens = useMemo(() => md.parse(text, {}), [text]);

  const rendered = useMemo(() => {
    return renderTokens(tokens, glossaryTerms);
  }, [tokens, glossaryTerms]);

  return <div className="prose prose-sm max-w-none text-on-surface-variant">{rendered}</div>;
}
