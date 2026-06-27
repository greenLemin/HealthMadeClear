import fs from "fs";
import path from "path";
import type { GlossaryTerm } from "../src/types/glossary";
import { getAllGlossaryFromMdx } from "../src/lib/glossary/mdxParser";

function termToMdx(term: GlossaryTerm) {
  const { definition, relatedTerms, ...meta } = term;
  const frontmatter: Record<string, unknown> = { ...meta };
  if (relatedTerms?.length) {
    frontmatter.relatedTerms = relatedTerms;
  }

  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");

  return `---\n${yaml}\n---\n\n${definition}\n`;
}

function writeTerm(locale: "en" | "es", term: GlossaryTerm) {
  const dir = path.join(process.cwd(), "content", "glossary", locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${term.id}.mdx`), termToMdx(term), "utf8");
}

async function main() {
  const glossaryTerms = await getAllGlossaryFromMdx("en");
  for (const term of glossaryTerms) {
    writeTerm("en", term);
  }

  const esTerms = await getAllGlossaryFromMdx("es");
  for (const term of esTerms) {
    writeTerm("es", term);
  }

  console.log(`Generated ${glossaryTerms.length} EN and ${esTerms.length} ES glossary MDX files.`);
}

main().catch(console.error);
