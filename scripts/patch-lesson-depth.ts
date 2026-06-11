/**
 * Appends depth sections to expansion lesson MDX files.
 * Run: npx tsx scripts/patch-lesson-depth.ts
 */
import fs from "fs";
import path from "path";
import { LESSON_DEPTH_ADDITIONS } from "./lesson-depth-additions";

const MARKER = "<!-- lesson-depth-added -->";

function patchLesson(locale: "en" | "es", slug: string) {
  const filePath = path.join(process.cwd(), "content", "lessons", locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");
  if (content.includes(MARKER)) {
    console.log(`Skip ${locale}/${slug} (already patched)`);
    return;
  }
  const addition = LESSON_DEPTH_ADDITIONS[slug]?.[locale];
  if (!addition) {
    console.warn(`No addition for ${locale}/${slug}`);
    return;
  }
  content = content.trimEnd() + "\n" + addition.trim() + "\n" + MARKER + "\n";
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Patched ${locale}/${slug}`);
}

for (const slug of Object.keys(LESSON_DEPTH_ADDITIONS)) {
  patchLesson("en", slug);
  patchLesson("es", slug);
}

console.log("Done patching lesson depth.");
