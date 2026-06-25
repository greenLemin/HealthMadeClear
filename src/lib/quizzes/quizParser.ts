import fs from "fs/promises";

import path from "path";
import matter from "gray-matter";
import type { Quiz, QuizQuestion } from "@/types/quiz";
import type { LessonId } from "@/types/content";
import { normalizeLineEndings } from "@/lib/normalizeLineEndings";
import { LESSON_IDS } from "@/types/content";

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
      const line = lines[i];
      if (phase === "question" && OPTION_REGEX.test(line)) {
        phase = "options";
      }
      if (phase === "options" && line.startsWith("answer:")) {
        phase = "answer";
      }
      if (phase === "question") {
        questionEnd = i;
      }
      if (phase === "options" && line.startsWith("answer:")) {
        phase = "answer";
      }
      if (phase === "options" && !line.startsWith("answer:")) {
        optionLines.push(line);
      }
      if (phase === "answer") {
        if (line.startsWith("answer:")) {
          const letter = line.replace("answer:", "").trim().toUpperCase();
          if (["A", "B", "C", "D"].includes(letter)) answer = letter;
        } else if (line.startsWith("explanation:")) {
          explanation = line.replace("explanation:", "").trim();
        }
      }
    }

    if (!answer && lines.length) {
      for (const line of lines) {
        if (line.startsWith("answer:")) {
          const letter = line.replace("answer:", "").trim().toUpperCase();
          if (["A", "B", "C", "D"].includes(letter)) answer = letter;
        }
      }
    }

    if (!explanation && lines.length) {
      for (const line of lines) {
        if (line.startsWith("explanation:")) {
          explanation = line.replace("explanation:", "").trim();
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

export async function getAllQuizzesFromMdx(locale: "en" | "es"): Promise<Quiz[]> {
  const dir = getQuizMdxDir(locale);

  const promises = LESSON_IDS.map(async (id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    try {
      await fs.access(filePath);
    } catch {
      return null;
    }
    const raw = normalizeLineEndings(await fs.readFile(filePath, "utf8"));
    const { data, content } = matter(raw);

    return {
      id: String(data.id),
      title: String(data.title),
      lessonId: String(data.lessonId) as LessonId,
      passScore: Number(data.passScore) || 70,
      questions: parseQuestions(content.trim()),
    } as Quiz;
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean) as Quiz[];
}

export async function getQuizFromMdx(id: string, locale: "en" | "es"): Promise<Quiz | undefined> {
  const filePath = path.join(getQuizMdxDir(locale), `${id}.mdx`);
  try {
    await fs.access(filePath);
  } catch {
    return undefined;
  }
  const raw = normalizeLineEndings(await fs.readFile(filePath, "utf8"));
  const { data, content } = matter(raw);

  return {
    id: String(data.id),
    title: String(data.title),
    lessonId: String(data.lessonId) as LessonId,
    passScore: Number(data.passScore) || 70,
    questions: parseQuestions(content.trim()),
  } as Quiz;
}

export async function assertAllQuizzesExist(locale: "en" | "es"): Promise<void> {
  const dir = getQuizMdxDir(locale);
  const promises = LESSON_IDS.map(async (id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`Missing quiz MDX file: ${filePath}`);
    }
  });
  await Promise.all(promises);
}
