/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import { parseQuestions, getQuizFromMdx, assertAllQuizzesExist, getAllQuizzesFromMdx } from "@/lib/quizzes/quizParser";

describe("Quiz Parser", () => {
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

  it("parses multiple questions", () => {
    const markdown = `
## Question 1

What is 2+2?

A) 3
B) 4
C) 5
D) 6

answer: B
explanation: 2+2 equals 4.

## Question 2

What is the capital of France?

A) London
B) Berlin
C) Paris
D) Madrid

answer: C
explanation: Paris is the capital of France.
`;

    const questions = parseQuestions(markdown);

    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBe("What is 2+2?");
    expect(questions[1].question).toBe("What is the capital of France?");
  });

  it("handles questions without explanation", () => {
    const markdown = `
## Question 1

What is 2+2?

A) 3
B) 4
C) 5
D) 6

answer: B
`;

    const questions = parseQuestions(markdown);

    expect(questions).toHaveLength(1);
    expect(questions[0].explanation).toBe("");
  });

  it("handles multiline question text", () => {
    const markdown = `
## Question 1

What is the
result of 2+2?

A) 3
B) 4
C) 5
D) 6

answer: B
explanation: Basic addition.
`;

    const questions = parseQuestions(markdown);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toContain("What is the");
    expect(questions[0].question).toContain("result of 2+2?");
  });

  it("parses Spanish Pregunta headings", () => {
    const markdown = `
## Pregunta 1

¿Cuál es 2+2?

A) 3
B) 4
C) 5
D) 6

answer: B
explanation: 2+2 es 4.
`;

    const questions = parseQuestions(markdown);

    expect(questions).toHaveLength(1);
    expect(questions[0].question).toBe("¿Cuál es 2+2?");
    expect(questions[0].correctAnswer).toBe("B");
    expect(questions[0].explanation).toBe("2+2 es 4.");
  });

  it("handles lowercase answer letters", () => {
    const markdown = `
## Question 1

Test?

A) One
B) Two

answer: b
explanation: Explanation.
`;

    const questions = parseQuestions(markdown);

    expect(questions[0].correctAnswer).toBe("B");
  });
});

describe("getQuizFromMdx", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns undefined if file does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    expect(getQuizFromMdx("non-existent", "en")).toBeUndefined();
  });

  it("returns parsed quiz when file exists", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`---
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
    const quiz = getQuizFromMdx("test-quiz", "en");
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
});

describe("assertAllQuizzesExist", () => {
  it("throws an error if a quiz is missing", () => {
    const existsSyncSpy = vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(() => assertAllQuizzesExist("en")).toThrowError(/Missing quiz MDX file:/);

    existsSyncSpy.mockRestore();
  });
});


describe("getAllQuizzesFromMdx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an array of quizzes for existing files", () => {
    vi.spyOn(fs, "existsSync").mockImplementation((path) => {
      if (typeof path === "string") {
        if (path.includes("understanding-prescription-labels")) return true;
        if (path.includes("asking-about-medications")) return true;
      }
      return false;
    });

    vi.spyOn(fs, "readFileSync").mockImplementation((path) => {
      if (typeof path === "string") {
        if (path.includes("understanding-prescription-labels")) {
          return `---
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
`;
        }
        if (path.includes("asking-about-medications")) {
          return `---
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
`;
        }
      }
      return "";
    });

    const quizzes = getAllQuizzesFromMdx("en");

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
    expect(quizzes[1].passScore).toBe(70); // default
    expect(quizzes[1].questions).toHaveLength(1);
  });

  it("returns empty array when no files exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    const quizzes = getAllQuizzesFromMdx("en");

    expect(quizzes).toHaveLength(0);
  });
});
