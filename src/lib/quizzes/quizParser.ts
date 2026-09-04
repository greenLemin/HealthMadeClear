import fs from "fs/promises";

import path from "path";
import matter from "gray-matter";
import type { Quiz, QuizQuestion } from "@/types/quiz";
import type { LessonId } from "@/types/content";
import { normalizeLineEndings } from "@/lib/normalizeLineEndings";
import { LESSON_IDS } from "@/types/content";
import { logger } from "@/lib/logger";

const OPTION_REGEX = /^([A-D])\)\s(.+)$/m;
const QUESTION_HEADING_REGEX = /^(Question|Pregunta)\s+\d+/i;

export function parseQuestions(markdown: string): QuizQuestion[] {
  const parts = markdown.split(/^## /m).filter(Boolean);
  const questions: QuizQuestion[] = [];

  for (const part of parts) {
    const newline = part.indexOf("\n");
    const heading = newline === -1 ? part.trim() : part.slice(0, newline).trim();
    if (!QUESTION_HEADING_REGEX.test(heading)) continue;

    const body = newline === -1 ? "" : part.slice(newline + 1).trim();
    const lines = body
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let questionEnd = 0;
    const optionLines: string[] = [];
    let answer = "";
    let explanation = "";
    let phase: "question" | "options" | "answer" = "question";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;

      if (line.startsWith("answer:")) {
        phase = "answer";
        const letter = line.replace("answer:", "").trim().toUpperCase();
        if (["A", "B", "C", "D"].includes(letter)) answer = letter;
      } else if (line.startsWith("explanation:")) {
        phase = "answer";
        explanation = line.replace("explanation:", "").trim();
      } else {
        if (phase === "question" && OPTION_REGEX.test(line)) {
          phase = "options";
        }
        if (phase === "question") {
          questionEnd = i;
        }
        if (phase === "options") {
          optionLines.push(line);
        }
      }
    }

    const question = lines
      .slice(0, questionEnd + 1)
      .join(" ")
      .trim();
    const options = optionLines.map((ol) => ol.replace(/^[A-D]\)\s/, "").trim());

    if (question && options.length >= 2 && answer) {
      questions.push({
        question,
        options: options.slice(0, 4),
        correctAnswer: answer as "A" | "B" | "C" | "D",
        explanation,
      });
    }
  }

  return questions;
}

export function getQuizMdxDir(locale: "en" | "es") {
  return path.join(process.cwd(), "content", "quizzes", locale);
}

function validateQuizFrontmatter(data: Record<string, unknown>, filePath: string, fallbackId: string) {
  if (!data.id || typeof data.id !== "string" || String(data.id).trim() === "") {
    throw new Error(`Quiz ${fallbackId} is missing required field 'id' in ${filePath}`);
  }
  if (!data.title || typeof data.title !== "string" || String(data.title).trim() === "") {
    throw new Error(`Quiz ${fallbackId} is missing required field 'title' in ${filePath}`);
  }
  if (!data.lessonId || typeof data.lessonId !== "string" || String(data.lessonId).trim() === "") {
    throw new Error(`Quiz ${fallbackId} is missing required field 'lessonId' in ${filePath}`);
  }
  // Validate lessonId is known
  if (!LESSON_IDS.includes(String(data.lessonId) as LessonId)) {
    throw new Error(`Quiz ${fallbackId} has invalid lessonId '${String(data.lessonId)}' in ${filePath}`);
  }
}

function parsePassScore(data: Record<string, unknown>, filePath: string, fallbackId: string): number {
  if (data.passScore == null || data.passScore === "") {
    return 70;
  }
  const n = Number(data.passScore);
  if (!Number.isFinite(n) || n <= 0 || n > 100) {
    throw new Error(`Quiz ${fallbackId} has invalid passScore '${String(data.passScore)}' in ${filePath}`);
  }
  return n;
}

export async function getAllQuizzesFromMdx(locale: "en" | "es"): Promise<Quiz[]> {
  const dir = getQuizMdxDir(locale);

  return Promise.all(
    LESSON_IDS.map(async (id) => {
      const filePath = path.join(dir, `${id}.mdx`);
      let fileContent: string;
      try {
        fileContent = await fs.readFile(filePath, "utf8");
      } catch {
        throw new Error(`Missing quiz MDX file: ${filePath}`);
      }

      const raw = normalizeLineEndings(fileContent);
      let data: Record<string, unknown>;
      let content: string;
      try {
        const parsed = matter(raw);
        data = parsed.data as Record<string, unknown>;
        content = parsed.content;
      } catch (error) {
        logger.error(`Failed to parse frontmatter in quiz MDX file: ${filePath}`, error);
        throw error instanceof Error ? error : new Error(String(error));
      }

      validateQuizFrontmatter(data, filePath, id);
      const passScore = parsePassScore(data, filePath, id);
      const questions = parseQuestions(content.trim());

      return {
        id: String(data.id),
        title: String(data.title),
        lessonId: String(data.lessonId) as LessonId,
        passScore,
        questions,
      } as Quiz;
    })
  );
}

export async function getQuizFromMdx(id: string, locale: "en" | "es"): Promise<Quiz | undefined> {
  const filePath = path.join(getQuizMdxDir(locale), `${id}.mdx`);
  let fileContent: string;
  try {
    fileContent = await fs.readFile(filePath, "utf8");
  } catch {
    return undefined;
  }
  const raw = normalizeLineEndings(fileContent);
  let data: Record<string, unknown>;
  let content: string;
  try {
    const parsed = matter(raw);
    data = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch (error) {
    logger.error(`Failed to parse frontmatter in quiz MDX file: ${filePath}`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }

  validateQuizFrontmatter(data, filePath, id);
  const passScore = parsePassScore(data, filePath, id);

  return {
    id: String(data.id),
    title: String(data.title),
    lessonId: String(data.lessonId) as LessonId,
    passScore,
    questions: parseQuestions(content.trim()),
  } as Quiz;
}

export async function assertAllQuizzesExist(locale: "en" | "es"): Promise<void> {
  const dir = getQuizMdxDir(locale);
  const BATCH_SIZE = 10;

  for (let i = 0; i < LESSON_IDS.length; i += BATCH_SIZE) {
    const batch = LESSON_IDS.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (id) => {
      const filePath = path.join(dir, `${id}.mdx`);
      try {
        await fs.access(filePath);
      } catch {
        throw new Error(`Missing quiz MDX file: ${filePath}`);
      }
    });
    await Promise.all(promises);
  }
}
