/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { parseQuestions } from "@/lib/quizzes/quizParser";

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
