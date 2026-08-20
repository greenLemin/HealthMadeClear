/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { parseQuestions } from "@/lib/quizzes/quizParser";

const { mockAccess, mockReadFile } = vi.hoisted(() => ({
  mockAccess: vi.fn(),
  mockReadFile: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: { access: mockAccess, readFile: mockReadFile },
  access: mockAccess,
  readFile: mockReadFile,
}));

import { getQuizFromMdx, getAllQuizzesFromMdx } from "@/lib/quizzes/quizParser";

afterEach(() => {
  vi.clearAllMocks();
});

describe("Quiz Parser - parseQuestions", () => {
  it("parses a single question with options and explanation", () => {
    const markdown = `
## Question 1

What is 2+2?

A) 3
B) 4
C) 5
D) 6

answer: B
explanation: 2+2 equals 4.
`;

    const questions = parseQuestions(markdown);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("What is 2+2?");
    expect(questions[0].options).toEqual(["3", "4", "5", "6"]);
    expect(questions[0].correctAnswer).toBe("B");
    expect(questions[0].explanation).toBe("2+2 equals 4.");
  });

  it("returns an empty array when given an empty string or whitespace", () => {
    expect(parseQuestions("")).toEqual([]);
    expect(parseQuestions("   \n\t  ")).toEqual([]);
    expect(parseQuestions("   \n\n  ")).toEqual([]);
  });

  it("parses Spanish question headings ('Pregunta 1')", () => {
    const markdown = `
## Pregunta 1

¿Cuánto es 2+2?

A) 3
B) 4

answer: B
explanation: 2+2 es 4.
`;

    const questions = parseQuestions(markdown);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("¿Cuánto es 2+2?");
    expect(questions[0].options).toEqual(["3", "4"]);
    expect(questions[0].correctAnswer).toBe("B");
    expect(questions[0].explanation).toBe("2+2 es 4.");
  });

  it("ignores section headings that do not match question pattern", () => {
    const markdown = `
## Introduction

Welcome to the quiz!

## Overview

Here is an overview.
`;

    const questions = parseQuestions(markdown);
    expect(questions).toEqual([]);
  });

  it("ignores heading-only sections without body or options", () => {
    const markdown = `
## Question 1
`;

    const questions = parseQuestions(markdown);
    expect(questions).toEqual([]);
  });

  it("ignores questions missing an answer tag", () => {
    const markdown = `
## Question 1

What is 2+2?

A) 3
B) 4

explanation: missing answer line
`;

    const questions = parseQuestions(markdown);
    expect(questions).toEqual([]);
  });

  it("ignores questions with invalid answer letter", () => {
    const markdown1 = `
## Question 1

What is 2+2?

A) 3
B) 4

answer: E
explanation: Invalid answer E
`;

    const markdown2 = `
## Question 2

What is 2+2?

A) 3
B) 4

answer: 123
`;

    expect(parseQuestions(markdown1)).toEqual([]);
    expect(parseQuestions(markdown2)).toEqual([]);
  });

  it("ignores questions with fewer than 2 options", () => {
    const markdown = `
## Question 1

What is 2+2?

A) 4

answer: A
`;

    const questions = parseQuestions(markdown);
    expect(questions).toEqual([]);
  });

  it("ignores options with non-matching format", () => {
    const markdown = `
## Question 1

What is 2+2?

1. 3
2. 4

answer: A
`;

    const questions = parseQuestions(markdown);
    expect(questions).toEqual([]);
  });

  it("parses valid questions while skipping malformed ones in the same file", () => {
    const markdown = `
## Overview
Some intro text.

## Question 1

What is 2+2?

A) 3
B) 4

answer: B
explanation: Correct!

## Question 2

Malformed question with no options or answer.

## Question 3

What is 3+3?

A) 5
B) 6
C) 7
D) 8

answer: B
`;

    const questions = parseQuestions(markdown);
    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe("What is 2+2?");
    expect(questions[0].correctAnswer).toBe("B");
    expect(questions[1].question).toBe("What is 3+3?");
    expect(questions[1].correctAnswer).toBe("B");
    expect(questions[1].explanation).toBe("");
  });

  it("handles questions without explanation gracefully", () => {
    const markdown = `
## Question 1

What is 1+1?

A) 1
B) 2

answer: B
`;

    const questions = parseQuestions(markdown);
    expect(questions).toHaveLength(1);
    expect(questions[0].explanation).toBe("");
  });
});

describe("getQuizFromMdx", () => {
  it("returns undefined if file does not exist", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));
    expect(await getQuizFromMdx("non-existent", "en")).toBeUndefined();
  });

  it("returns undefined if file access fails", async () => {
    mockReadFile.mockRejectedValue(new Error("EACCES"));
    expect(await getQuizFromMdx("no-access", "en")).toBeUndefined();
  });

  it("returns parsed quiz when file exists", async () => {
    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(`---
id: "test-quiz"
title: "Test Quiz"
lessonId: "test-lesson"
passScore: 80
---

## Question 1

What is 2+2?

A) 3
B) 4
C) 5
D) 6

answer: B
explanation: 2+2 equals 4.
`);
    const quiz = await getQuizFromMdx("test-quiz", "en");
    expect(quiz).toEqual({
      id: "test-quiz",
      title: "Test Quiz",
      lessonId: "test-lesson",
      passScore: 80,
      questions: [
        {
          question: "What is 2+2?",
          options: ["3", "4", "5", "6"],
          correctAnswer: "B",
          explanation: "2+2 equals 4.",
        },
      ],
    });
  });

  it("defaults passScore to 70 when passScore is missing or invalid in frontmatter", async () => {
    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(`---
id: "test-quiz-no-passscore"
title: "Test Quiz"
lessonId: "test-lesson"
---

## Question 1

What is 1+1?

A) 1
B) 2

answer: B
`);
    const quiz = await getQuizFromMdx("test-quiz-no-passscore", "en");
    expect(quiz?.passScore).toBe(70);
  });

  it("filters out malformed questions from MDX content in getQuizFromMdx", async () => {
    mockAccess.mockResolvedValue(undefined);
    mockReadFile.mockResolvedValue(`---
id: "test-quiz-malformed"
title: "Test Quiz"
lessonId: "test-lesson"
passScore: 75
---

## Question 1

Broken question with no options or answer.
`);
    const quiz = await getQuizFromMdx("test-quiz-malformed", "en");
    expect(quiz?.questions).toEqual([]);
  });
});

describe("getAllQuizzesFromMdx", () => {
  it("returns an array of quizzes for existing files", async () => {
    mockAccess.mockImplementation((path) => {
      if (typeof path === "string") {
        if (path.includes("understanding-prescription-labels")) return Promise.resolve();
        if (path.includes("asking-about-medications")) return Promise.resolve();
      }
      return Promise.reject(new Error("ENOENT"));
    });

    mockReadFile.mockImplementation((path) => {
      if (typeof path === "string") {
        if (path.includes("understanding-prescription-labels")) {
          return Promise.resolve(`---
id: quiz-1
title: Quiz 1
lessonId: understanding-prescription-labels
passScore: 80
---

## Question 1

Q1?

A) 1
B) 2
C) 3
D) 4

answer: A
explanation: 1 is correct.
`);
        }
        if (path.includes("asking-about-medications")) {
          return Promise.resolve(`---
id: quiz-2
title: Quiz 2
lessonId: asking-about-medications
---

## Question 1

Q2?

A) 1
B) 2
C) 3
D) 4

answer: B
explanation: 2 is correct.
`);
        }
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const quizzes = await getAllQuizzesFromMdx("en");

    expect(quizzes).toHaveLength(2);

    expect(quizzes[0].id).toBe("quiz-1");
    expect(quizzes[0].title).toBe("Quiz 1");
    expect(quizzes[0].lessonId).toBe("understanding-prescription-labels");
    expect(quizzes[0].passScore).toBe(80);
    expect(quizzes[0].questions).toHaveLength(1);
    expect(quizzes[0].questions[0].question).toBe("Q1?");
    expect(quizzes[0].questions[0].correctAnswer).toBe("A");

    expect(quizzes[1].id).toBe("quiz-2");
    expect(quizzes[1].title).toBe("Quiz 2");
    expect(quizzes[1].lessonId).toBe("asking-about-medications");
    expect(quizzes[1].passScore).toBe(70);
    expect(quizzes[1].questions).toHaveLength(1);
  });

  it("returns empty array when no files exist", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const quizzes = await getAllQuizzesFromMdx("en");

    expect(quizzes).toHaveLength(0);
  });

  it("returns null for quiz if file access fails in getAllQuizzesFromMdx mapped promises", async () => {
    mockReadFile.mockImplementation((path) => {
      if (typeof path === "string") {
        if (path.includes("understanding-prescription-labels")) return Promise.reject(new Error("EACCES"));
      }
      return Promise.reject(new Error("ENOENT"));
    });

    const quizzes = await getAllQuizzesFromMdx("en");
    expect(quizzes).toEqual([]);
  });

  it("returns undefined if file access fails in getAllQuizzesFromMdx", async () => {
    mockReadFile.mockRejectedValue(new Error("EACCES"));
    const quizzes = await getAllQuizzesFromMdx("en");
    expect(quizzes).toEqual([]);
  });
});
