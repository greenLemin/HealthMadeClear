import { getAllLessonsFromMdx } from "../src/lib/lessons/mdxParser";
import { getAllPathsFromMdx } from "../src/lib/paths/mdxParser";
import { getAllGlossaryFromMdx } from "../src/lib/glossary/mdxParser";
import { assertLocaleIdParity } from "./lib/validateLocaleParity";

const enLessons = getAllLessonsFromMdx("en");
const esLessons = getAllLessonsFromMdx("es");
assertLocaleIdParity(enLessons, esLessons, "lessons");

for (const lesson of [...enLessons, ...esLessons]) {
  if (!lesson.title || !lesson.description) {
    throw new Error(`Lesson ${lesson.id} is missing title or description`);
  }
  if (lesson.content.sections.length === 0) {
    throw new Error(`Lesson ${lesson.id} has no sections`);
  }
}

const enPaths = getAllPathsFromMdx("en");
const esPaths = getAllPathsFromMdx("es");
assertLocaleIdParity(enPaths, esPaths, "paths");

const enGlossary = getAllGlossaryFromMdx("en");
const esGlossary = getAllGlossaryFromMdx("es");
assertLocaleIdParity(enGlossary, esGlossary, "glossary");

console.log("Content validation passed.");
