export type CalloutType = "info" | "success" | "warning";

export interface Callout {
  type: CalloutType;
  content: string;
}

export interface Section {
  title: string;
  content: string;
  callouts?: Callout[];
}

const CALLOUT_REGEX = /:::([a-z]+)\n([\s\S]*?)\n:::/g;

export function parseCallouts(block: string): { content: string; callouts: Callout[] | undefined } {
  const callouts: Callout[] = [];
  let content = block;

  for (const match of Array.from(block.matchAll(CALLOUT_REGEX))) {
    const type = match[1] as CalloutType;
    if (type === "info" || type === "success" || type === "warning") {
      callouts.push({ type, content: match[2].trim() });
    }
    content = content.replace(match[0], "").trim();
  }

  return { content: content.trim(), callouts: callouts.length ? callouts : undefined };
}

export function parseSections(markdown: string): Section[] {
  const parts = markdown.split(/^## /m).filter(Boolean);

  return parts.map((part) => {
    const newline = part.indexOf("\n");
    const title = newline === -1 ? part.trim() : part.slice(0, newline).trim();
    const body = newline === -1 ? "" : part.slice(newline + 1).trim();
    const { content, callouts } = parseCallouts(body);
    return { title, content, callouts };
  });
}
