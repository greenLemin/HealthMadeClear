import fs from "fs";
import path from "path";
import type { Lesson } from "../src/data/lessons";
import { getAllLessonsFromMdx } from "../src/lib/lessons/mdxParser";

function sectionToMarkdown(section: {
  title: string;
  content: string;
  callouts?: { type: string; content: string }[];
}) {
  let block = `## ${section.title}\n\n${section.content}`;
  for (const callout of section.callouts ?? []) {
    block += `\n\n:::${callout.type}\n${callout.content}\n:::`;
  }
  return block;
}

function lessonToMdx(lesson: Lesson) {
  const frontmatter = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category,
    categoryId: lesson.categoryId,
    duration: lesson.duration,
    level: lesson.level,
  };

  const body = lesson.content.sections.map(sectionToMarkdown).join("\n\n");
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");

  return `---\n${yaml}\n---\n\n${body}\n`;
}

function writeLesson(locale: "en" | "es", lesson: Lesson) {
  const dir = path.join(process.cwd(), "content", "lessons", locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${lesson.id}.mdx`), lessonToMdx(lesson), "utf8");
}

async function main() {
  const lessons = await getAllLessonsFromMdx("en");
  for (const lesson of lessons) {
    writeLesson("en", lesson);
  }

  const esLessons = await getAllLessonsFromMdx("es");
  for (const lesson of esLessons) {
    writeLesson("es", lesson);
  }

  console.log(`Generated ${lessons.length} EN and ${esLessons.length} ES lesson MDX files.`);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
