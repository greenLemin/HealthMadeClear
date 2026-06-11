/**
 * Patches stub quiz explanations in MDX files.
 * Run: npx tsx scripts/patch-quiz-explanations.ts
 */
import fs from "fs";
import path from "path";
import { QUIZ_EXPLANATION_PATCHES } from "./quiz-explanation-patches";

const STUB_PATTERN = /explanation: .+ — correct\.\n/g;

function patchQuizFile(locale: "en" | "es", slug: string) {
  const filePath = path.join(process.cwd(), "content", "quizzes", locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing ${filePath}`);
    return;
  }
  const patch = QUIZ_EXPLANATION_PATCHES[slug];
  if (!patch) {
    console.warn(`No patch data for ${slug}`);
    return;
  }
  const explanations = locale === "en" ? patch.en : patch.es;
  let content = fs.readFileSync(filePath, "utf8");
  let i = 0;
  content = content.replace(STUB_PATTERN, () => {
    const explanation = explanations[i++];
    if (!explanation) throw new Error(`Not enough explanations for ${locale}/${slug}`);
    return `explanation: ${explanation}\n`;
  });
  if (i !== explanations.length) {
    const remaining = (content.match(STUB_PATTERN) || []).length;
    if (remaining > 0 || i < explanations.length) {
      throw new Error(
        `Patch count mismatch for ${locale}/${slug}: applied ${i}, expected ${explanations.length}`
      );
    }
  }
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Patched ${locale}/${slug}`);
}

for (const slug of Object.keys(QUIZ_EXPLANATION_PATCHES)) {
  patchQuizFile("en", slug);
  patchQuizFile("es", slug);
}

console.log("Done patching quiz explanations.");
