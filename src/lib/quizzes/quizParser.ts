import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Quiz, QuizQuestion } from "@/types/quiz";
import type { LessonId } from "@/types/content";
import { LESSON_IDS } from "@/types/content";

const OPTION_REGEX = /^([A-D])\)\s(.+)$/m;

export function parseQuestions(markdown: string): QuizQuestion[] {
  const parts = markdown.split(/^## /m).filter(Boolean);
  const questions: QuizQuestion[] = [];

  for (const part of parts) {
    const newline = part.indexOf("\n");
    const heading = newline === -1 ? part.trim() : part.slice(0, newline).trim();
    if (!heading.startsWith("Question")) continue;

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

export function getAllQuizzesFromMdx(locale: "en" | "es"): Quiz[] {
  const dir = getQuizMdxDir(locale);

  return LESSON_IDS.map((id) => {
    const filePath = path.join(dir, `${id}.mdx`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);

    return {
      id: String(data.id),
      title: String(data.title),
      lessonId: String(data.lessonId) as LessonId,
      passScore: Number(data.passScore) || 70,
      questions: parseQuestions(content.trim()),
    } as Quiz;
  }).filter(Boolean) as Quiz[];
}

export function getQuizFromMdx(id: string, locale: "en" | "es"): Quiz | undefined {
  const filePath = path.join(getQuizMdxDir(locale), `${id}.mdx`);
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    id: String(data.id),
    title: String(data.title),
    lessonId: String(data.lessonId) as LessonId,
    passScore: Number(data.passScore) || 70,
    questions: parseQuestions(content.trim()),
  } as Quiz;
}

export function assertAllQuizzesExist(locale: "en" | "es"): void {
  const dir = getQuizMdxDir(locale);
  for (const id of LESSON_IDS) {
    const filePath = path.join(dir, `${id}.mdx`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing quiz MDX file: ${filePath}`);
    }
  }
}
