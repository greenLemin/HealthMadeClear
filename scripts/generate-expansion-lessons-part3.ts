/**
 * Generates part 3 expansion lessons + quizzes (en/es).
 * Run: npx tsx scripts/generate-expansion-lessons-part3.ts
 */
import fs from "fs";
import path from "path";

import type { LessonSpec } from "./expansion-lessons-types";
import { EXPANSION_LESSONS_PART3 } from "./expansion-lessons-data-part3";

const SOURCES = ["NIH", "CDC", "MedlinePlus"];
const LAST_REVIEWED = "2026-06-25";

function writeLesson(locale: "en" | "es", spec: LessonSpec) {
  const data = locale === "en" ? spec.en : spec.es;
  const fm = {
    id: spec.id,
    title: data.title,
    description: data.description,
    category: spec.category,
    categoryId: spec.categoryId,
    duration: spec.duration,
    level: spec.level,
    sidebarTitle: data.sidebarTitle,
    sidebarTips: data.sidebarTips,
    lastReviewed: LAST_REVIEWED,
    sources: SOURCES,
    reviewedBy: "RN Health Education Team",
  };
  const yaml = Object.entries(fm)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - "${x}"`).join("\n")}`;
      return `${k}: "${v}"`;
    })
    .join("\n");
  const out = path.join(process.cwd(), "content", "lessons", locale, `${spec.id}.mdx`);
  fs.writeFileSync(out, `---\n${yaml}\n---\n\n${data.body}\n`, "utf8");
}

function writeQuiz(locale: "en" | "es", spec: LessonSpec) {
  const title = locale === "en" ? spec.quiz.enTitle : spec.quiz.esTitle;
  const questions = locale === "en" ? spec.quiz.enQuestions : spec.quiz.esQuestions;
  const qLabel = locale === "en" ? "Question" : "Pregunta";
  const body = questions
    .map((item, i) => {
      const [a, b, c, d] = item.options;
      return `## ${qLabel} ${i + 1}\n\n${item.q}\n\nA) ${a}\nB) ${b}\nC) ${c}\nD) ${d}\n\nanswer: ${item.answer}\nexplanation: ${item.explanation}`;
    })
    .join("\n\n");
  const fm = `---\nid: "${spec.id}"\ntitle: "${title}"\nlessonId: "${spec.id}"\npassScore: 70\n---\n\n`;
  const out = path.join(process.cwd(), "content", "quizzes", locale, `${spec.id}.mdx`);
  fs.writeFileSync(out, fm + body + "\n", "utf8");
}

for (const spec of EXPANSION_LESSONS_PART3) {
  writeLesson("en", spec);
  writeLesson("es", spec);
  writeQuiz("en", spec);
  writeQuiz("es", spec);
  console.log(`Wrote ${spec.id}`);
}

console.log(`Generated ${EXPANSION_LESSONS_PART3.length} part 3 lessons (en + es + quizzes).`);
