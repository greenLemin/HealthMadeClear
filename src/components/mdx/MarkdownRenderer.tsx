"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import InlineGlossaryTerm from "./InlineGlossaryTerm";
import type { GlossaryTerm } from "@/types/glossary";
import type MarkdownItToken from "markdown-it/lib/token.mjs";

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

function renderInlineChildren(
  children: MarkdownItToken[],
  glossaryTerms: GlossaryTerm[],
  keyPrefix: string
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let index = 0;

  while (index < children.length) {
    const child = children[index];

    if (child.type === "text" && child.content) {
      nodes.push(
        <GlossaryHighlighter
          key={`${keyPrefix}-text-${index}`}
          text={child.content}
          glossaryTerms={glossaryTerms}
        />
      );
      index++;
      continue;
    }

    if (child.type === "strong_open") {
      const inner: React.ReactNode[] = [];
      index++;
      while (index < children.length && children[index].type !== "strong_close") {
        if (children[index].type === "text" && children[index].content) {
          inner.push(
            <GlossaryHighlighter
              key={`${keyPrefix}-strong-${index}`}
              text={children[index].content ?? ""}
              glossaryTerms={glossaryTerms}
            />
          );
        }
        index++;
      }
      nodes.push(<strong key={`${keyPrefix}-strong-wrap-${index}`}>{inner}</strong>);
      index++;
      continue;
    }

    if (child.type === "em_open") {
      const inner: React.ReactNode[] = [];
      index++;
      while (index < children.length && children[index].type !== "em_close") {
        if (children[index].type === "text" && children[index].content) {
          inner.push(
            <GlossaryHighlighter
              key={`${keyPrefix}-em-${index}`}
              text={children[index].content ?? ""}
              glossaryTerms={glossaryTerms}
            />
          );
        }
        index++;
      }
      nodes.push(<em key={`${keyPrefix}-em-wrap-${index}`}>{inner}</em>);
      index++;
      continue;
    }

    index++;
  }

  return nodes;
}

function renderTokens(
  tokens: MarkdownItToken[],
  glossaryTerms: GlossaryTerm[],
  index: number = 0
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let i = index;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === "inline") {
      if (token.children) {
        result.push(...renderInlineChildren(token.children, glossaryTerms, `inline-${i}`));
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
      const level = parseInt(token.tag?.slice(1) ?? "2", 10) || 2;
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
