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

import { getQuizFromMdx, assertAllQuizzesExist, getAllQuizzesFromMdx } from "@/lib/quizzes/quizParser";

afterEach(() => {
  vi.clearAllMocks();
});

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
});

describe("getQuizFromMdx", () => {
  it("returns undefined if file does not exist", async () => {
    mockAccess.mockRejectedValue(new Error("ENOENT"));
    expect(await getQuizFromMdx("non-existent", "en")).toBeUndefined();
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
});

describe("assertAllQuizzesExist", () => {
  it("throws an error if a quiz is missing", async () => {
    mockAccess.mockRejectedValue(new Error("ENOENT"));

    await expect(assertAllQuizzesExist("en")).rejects.toThrow(/Missing quiz MDX file:/);
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
    mockAccess.mockRejectedValue(new Error("ENOENT"));

    const quizzes = await getAllQuizzesFromMdx("en");

    expect(quizzes).toHaveLength(0);
  });
});
