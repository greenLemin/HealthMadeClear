import { getAllLessonsFromMdx } from "../src/lib/lessons/mdxParser";
import { getAllPathsFromMdx } from "../src/lib/paths/mdxParser";
import { getAllGlossaryFromMdx } from "../src/lib/glossary/mdxParser";
import { getAllQuizzesFromMdx } from "../src/lib/quizzes/quizParser";
import { getAllArticlesFromMdx } from "../src/lib/articles/mdxParser";
import { assertLocaleIdParity } from "./lib/validateLocaleParity";

const enLessons = getAllLessonsFromMdx("en");
const esLessons = getAllLessonsFromMdx("es");
assertLocaleIdParity(enLessons, esLessons, "lessons");

const MAX_REVIEW_AGE_MS = 365 * 24 * 60 * 60 * 1000;

function assertFreshReview(id: string, lastReviewed: string | undefined) {
  if (!lastReviewed) {
    throw new Error(`${id} is missing lastReviewed (required for clinical review workflow)`);
  }
  const reviewed = new Date(lastReviewed);
  if (Number.isNaN(reviewed.getTime())) {
    throw new Error(`${id} has invalid lastReviewed date: ${lastReviewed}`);
  }
  if (Date.now() - reviewed.getTime() > MAX_REVIEW_AGE_MS) {
    throw new Error(`${id} lastReviewed (${lastReviewed}) is older than 12 months — re-review required`);
  }
}

for (const lesson of [...enLessons, ...esLessons]) {
  if (!lesson.title || !lesson.description) {
    throw new Error(`Lesson ${lesson.id} is missing title or description`);
  }
  if (lesson.content.sections.length === 0) {
    throw new Error(`Lesson ${lesson.id} has no sections`);
  }
  assertFreshReview(`Lesson ${lesson.id}`, lesson.lastReviewed);
}

const enPaths = getAllPathsFromMdx("en");
const esPaths = getAllPathsFromMdx("es");
assertLocaleIdParity(enPaths, esPaths, "paths");

const enGlossary = getAllGlossaryFromMdx("en");
const esGlossary = getAllGlossaryFromMdx("es");
assertLocaleIdParity(enGlossary, esGlossary, "glossary");

const enQuizzes = getAllQuizzesFromMdx("en");
const esQuizzes = getAllQuizzesFromMdx("es");
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
    const question = quiz.questions[index];
    if (!question.explanation || question.explanation.trim().length < 40) {
      throw new Error(`Quiz ${quiz.id} question ${index + 1} has a missing or too-short explanation`);
    }
    if (STUB_EXPLANATION.test(question.explanation.trim())) {
      throw new Error(`Quiz ${quiz.id} question ${index + 1} has a placeholder explanation`);
    }
  }
}

const enArticles = getAllArticlesFromMdx("en");
const esArticles = getAllArticlesFromMdx("es");
assertLocaleIdParity(enArticles, esArticles, "articles");

for (const article of [...enArticles, ...esArticles]) {
  if (!article.title || !article.description) {
    throw new Error(`Article ${article.id} is missing title or description`);
  }
  if (article.content.sections.length === 0) {
    throw new Error(`Article ${article.id} has no sections`);
  }
  assertFreshReview(`Article ${article.id}`, article.lastReviewed);
}

console.log("Content validation passed.");
