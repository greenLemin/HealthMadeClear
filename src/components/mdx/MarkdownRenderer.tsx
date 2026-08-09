"use client";

import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import GlossaryHighlighter from "./GlossaryHighlighter";
import type { GlossaryTerm } from "@/types/glossary";
import type MarkdownItToken from "markdown-it/lib/token.mjs";

const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Content authors write Markdown, so link targets are attacker-controlled if a
 * content file is ever compromised. Only allow a fixed set of protocols, and
 * resolve relative links against a dummy origin so anchors and site-relative
 * paths keep working.
 *
 * Control characters are stripped first: `java\0script:` and friends are
 * ignored by browsers when resolving a URL, so they must not survive into the
 * protocol check.
 */
function isSafeHref(href: string): boolean {
  // markdown-it percent-encodes control characters and spaces before we ever
  // see the href, so `java\0script:` arrives as `java%00script:`. Decode first,
  // then strip, so those payloads cannot smuggle a scheme past the check.
  let decoded = href;
  try {
    decoded = decodeURIComponent(href);
  } catch {
    // Malformed escape sequence — fall through and test the raw value.
  }
  const normalized = decoded.replace(/[\u0000-\u0020\u007F-\u009F]/g, "");
  if (normalized === "") return false;
  try {
    return SAFE_PROTOCOLS.has(new URL(normalized, "https://example.invalid").protocol);
  } catch {
    return false;
  }
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

    if (child.type === "link_open") {
      const href = child.attrGet("href") ?? "";
      const inner: React.ReactNode[] = [];
      index++;
      while (index < children.length && children[index].type !== "link_close") {
        if (children[index].type === "text" && children[index].content) {
          inner.push(
            <GlossaryHighlighter
              key={`${keyPrefix}-link-${index}`}
              text={children[index].content ?? ""}
              glossaryTerms={glossaryTerms}
            />
          );
        }
        index++;
      }
      const key = `${keyPrefix}-link-wrap-${index}`;
      nodes.push(
        isSafeHref(href) ? (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            {inner}
          </a>
        ) : (
          // Keep the link text so the sentence still reads, but drop the anchor.
          <span key={key}>{inner}</span>
        )
      );
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
      const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
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
      if (!isSafeHref(href)) {
        // Keep the link text so the sentence still reads, but drop the anchor.
        result.push(<span key={`link-${i}`}>{linkChildren}</span>);
      } else {
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
    } else if (token.type === "blockquote_open") {
      const inner: MarkdownItToken[] = [];
      let depth = 1;
      i++;
      while (i < tokens.length && depth > 0) {
        if (tokens[i].type === "blockquote_open") depth++;
        else if (tokens[i].type === "blockquote_close") {
          depth--;
          if (depth === 0) break;
        }
        inner.push(tokens[i]);
        i++;
      }
      result.push(
        <blockquote
          key={`bq-${i}`}
          className="border-l-4 border-primary-container pl-4 italic text-on-surface-variant"
        >
          {renderTokens(inner, glossaryTerms)}
        </blockquote>
      );
    } else if (token.type === "fence" || token.type === "code_block") {
      result.push(
        <pre key={`code-${i}`} className="overflow-x-auto rounded-lg bg-surface-container p-4 text-label-md">
          <code>{token.content}</code>
        </pre>
      );
    } else if (token.type === "table_open") {
      const { node, next } = renderTable(tokens, i, glossaryTerms);
      result.push(node);
      i = next;
      continue;
    }

    i++;
  }

  return result;
}

function renderTable(
  tokens: MarkdownItToken[],
  start: number,
  glossaryTerms: GlossaryTerm[]
): { node: React.ReactNode; next: number } {
  let i = start + 1;
  const head: React.ReactNode[] = [];
  const body: React.ReactNode[] = [];

  const renderRow = (isHeader: boolean, key: string) => {
    const cells: React.ReactNode[] = [];
    i++; // past tr_open
    while (i < tokens.length && tokens[i].type !== "tr_close") {
      const cellToken = tokens[i];
      if (cellToken.type === "th_open" || cellToken.type === "td_open") {
        const isTh = cellToken.type === "th_open";
        const cellChildren: React.ReactNode[] = [];
        i++;
        while (i < tokens.length && tokens[i].type !== "th_close" && tokens[i].type !== "td_close") {
          if (tokens[i].type === "inline") {
            cellChildren.push(...renderTokens([tokens[i]], glossaryTerms));
          }
          i++;
        }
        cells.push(
          isTh ? (
            <th key={`${key}-c${cells.length}`} scope="col" className="px-3 py-2 text-left font-semibold">
              {cellChildren}
            </th>
          ) : (
            <td key={`${key}-c${cells.length}`} className="px-3 py-2">
              {cellChildren}
            </td>
          )
        );
      }
      i++;
    }
    const row = <tr key={key}>{cells}</tr>;
    if (isHeader) head.push(row);
    else body.push(row);
  };

  while (i < tokens.length && tokens[i].type !== "table_close") {
    const t = tokens[i];
    if (t.type === "tr_open") {
      const inHead = head.length === 0 && body.length === 0;
      renderRow(inHead, `row-${i}`);
    }
    i++;
  }

  const node = (
    <div key={`table-${start}`} className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-label-md">
        {head.length > 0 ? <thead>{head}</thead> : null}
        <tbody>{body}</tbody>
      </table>
    </div>
  );

  return { node, next: i + 1 };
}

export default function MarkdownRenderer({ text, glossaryTerms }: MarkdownRendererProps) {
  const tokens = useMemo(() => md.parse(text, {}), [text]);

  const rendered = useMemo(() => {
    return renderTokens(tokens, glossaryTerms);
  }, [tokens, glossaryTerms]);

  return <div className="prose prose-sm max-w-none text-on-surface-variant">{rendered}</div>;
}
