import { getAllLessonsFromMdx } from "../src/lib/lessons/mdxParser";
import { getAllPathsFromMdx } from "../src/lib/paths/mdxParser";
import { getAllGlossaryFromMdx } from "../src/lib/glossary/mdxParser";
import { getAllQuizzesFromMdx } from "../src/lib/quizzes/quizParser";
import { getAllArticlesFromMdx } from "../src/lib/articles/mdxParser";
import { assertLocaleIdParity } from "./lib/validateLocaleParity";
import { LESSON_IDS } from "../src/types/content";

export const CITATION_DENYLIST = [
  "Web",
  "TBD",
  "TODO",
  "lorem",
  "placeholder",
  "Medical Team",
  "Internet",
  "Google",
  "N/A",
  "None",
  "Unknown",
] as const;

const DENYLIST_LOWER = new Set(CITATION_DENYLIST.map((value) => value.toLowerCase()));

export const MAX_REVIEW_WARN_MS = 365 * 24 * 60 * 60 * 1000;
export const MAX_REVIEW_FAIL_MS = 400 * 24 * 60 * 60 * 1000;

export function isDeniedCitation(value: string): boolean {
  return DENYLIST_LOWER.has(value.trim().toLowerCase());
}

export function assertFreshReview(id: string, lastReviewed: string | undefined) {
  if (!lastReviewed) {
    throw new Error(`${id} is missing lastReviewed (required for clinical review workflow)`);
  }
  const reviewed = new Date(lastReviewed);
  if (Number.isNaN(reviewed.getTime())) {
    throw new Error(`${id} has invalid lastReviewed date: ${lastReviewed}`);
  }
  const age = Date.now() - reviewed.getTime();
  if (age > MAX_REVIEW_FAIL_MS) {
    throw new Error(`${id} lastReviewed (${lastReviewed}) is older than 400 days — re-review required`);
  }
  if (age > MAX_REVIEW_WARN_MS) {
    console.warn(
      `Warning: ${id} lastReviewed (${lastReviewed}) is older than 12 months — re-review recommended`
    );
  }
}

export function assertSourcesAndReviewer(label: string, sources: unknown, reviewedBy: unknown): void {
  if (!Array.isArray(sources) || sources.length < 1) {
    throw new Error(`${label} is missing sources (at least one source required)`);
  }
  for (const source of sources) {
    const trimmed = String(source).trim();
    if (trimmed.length < 3) {
      throw new Error(`${label} has a source shorter than 3 characters`);
    }
    if (isDeniedCitation(trimmed)) {
      throw new Error(`${label} source is placeholder-denylisted: ${trimmed}`);
    }
  }
  const reviewer = String(reviewedBy ?? "").trim();
  if (reviewer.length < 3) {
    throw new Error(`${label} is missing reviewedBy (trimmed length must be ≥ 3)`);
  }
  if (isDeniedCitation(reviewer)) {
    throw new Error(`${label} reviewedBy is placeholder-denylisted: ${reviewer}`);
  }
}

async function main() {
  const enLessons = await getAllLessonsFromMdx("en");
  const esLessons = await getAllLessonsFromMdx("es");
  assertLocaleIdParity(enLessons, esLessons, "lessons");

  for (const lesson of [...enLessons, ...esLessons]) {
    if (!lesson.title || !lesson.description) {
      throw new Error(`Lesson ${lesson.id} is missing title or description`);
    }
    if (lesson.content.sections.length === 0) {
      throw new Error(`Lesson ${lesson.id} has no sections`);
    }
    assertFreshReview(`Lesson ${lesson.id}`, lesson.lastReviewed);
    assertSourcesAndReviewer(`Lesson ${lesson.id}`, lesson.sources, lesson.reviewedBy);
  }

  const enPaths = await getAllPathsFromMdx("en");
  const esPaths = await getAllPathsFromMdx("es");
  assertLocaleIdParity(enPaths, esPaths, "paths");

  for (const p of [...enPaths, ...esPaths]) {
    for (const lessonId of p.lessons) {
      if (!(LESSON_IDS as readonly string[]).includes(lessonId)) {
        throw new Error(`Path ${p.id} references unknown lesson ID: ${lessonId}`);
      }
    }
  }

  const enGlossary = await getAllGlossaryFromMdx("en");
  const esGlossary = await getAllGlossaryFromMdx("es");
  assertLocaleIdParity(enGlossary, esGlossary, "glossary");

  for (const term of [...enGlossary, ...esGlossary]) {
    if (!term.term || !term.term.trim()) {
      throw new Error(`Glossary ${term.id} is missing term`);
    }
    if (!term.category || !term.category.trim()) {
      throw new Error(`Glossary ${term.id} is missing category`);
    }
    if (!term.definition || !term.definition.trim()) {
      throw new Error(`Glossary ${term.id} is missing definition`);
    }
  }

  const enQuizzes = await getAllQuizzesFromMdx("en");
  const esQuizzes = await getAllQuizzesFromMdx("es");
  assertLocaleIdParity(enQuizzes, esQuizzes, "quizzes");

  const STUB_EXPLANATION = / — correct\.$/;

  for (const quiz of [...enQuizzes, ...esQuizzes]) {
    if (!quiz.title) {
      throw new Error(`Quiz ${quiz.id} is missing title`);
    }
    if (quiz.questions.length < 5) {
      throw new Error(`Quiz ${quiz.id} (${quiz.questions.length} questions) must have at least 5 questions`);
    }
    for (let index = 0; index < quiz.questions.length; index++) {
      const question = quiz.questions[index]!;
      if (!question.explanation || question.explanation.trim().length < 40) {
        throw new Error(`Quiz ${quiz.id} question ${index + 1} has a missing or too-short explanation`);
      }
      if (STUB_EXPLANATION.test(question.explanation.trim())) {
        throw new Error(`Quiz ${quiz.id} question ${index + 1} has a placeholder explanation`);
      }
    }
  }

  const enArticles = await getAllArticlesFromMdx("en");
  const esArticles = await getAllArticlesFromMdx("es");
  assertLocaleIdParity(enArticles, esArticles, "articles");

  for (const article of [...enArticles, ...esArticles]) {
    if (!article.title || !article.description) {
      throw new Error(`Article ${article.id} is missing title or description`);
    }
    if (article.content.sections.length === 0) {
      throw new Error(`Article ${article.id} has no sections`);
    }
    assertFreshReview(`Article ${article.id}`, article.lastReviewed);
    assertSourcesAndReviewer(`Article ${article.id}`, article.sources, article.reviewedBy);
  }

  console.log("Content validation passed.");
}

if (!process.env.VITEST) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
