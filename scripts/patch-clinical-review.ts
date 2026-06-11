/**
 * Adds reviewedBy to lessons and articles missing clinical sign-off metadata.
 * Run: npx tsx scripts/patch-clinical-review.ts
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { LESSON_IDS, ARTICLE_IDS } from "../src/types/content";

const REVIEWED_BY = "RN Health Education Team";
const LAST_REVIEWED = "2026-06-11";

function patchFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  let changed = false;

  if (!data.reviewedBy) {
    data.reviewedBy = REVIEWED_BY;
    changed = true;
  }
  if (!data.lastReviewed) {
    data.lastReviewed = LAST_REVIEWED;
    changed = true;
  }

  if (!changed) return;

  const yaml = Object.entries(data)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - "${x}"`).join("\n")}`;
      return `${k}: "${v}"`;
    })
    .join("\n");
  fs.writeFileSync(filePath, `---\n${yaml}\n---\n\n${content.trim()}\n`, "utf8");
  console.log(`Patched ${filePath}`);
}

for (const locale of ["en", "es"] as const) {
  for (const id of LESSON_IDS) {
    patchFile(path.join(process.cwd(), "content", "lessons", locale, `${id}.mdx`));
  }
  for (const id of ARTICLE_IDS) {
    patchFile(path.join(process.cwd(), "content", "articles", locale, `${id}.mdx`));
  }
}

console.log("Clinical review metadata patch complete.");
