import { describe, expect, it } from "vitest";
import { getAllQuizzesFromMdx } from "../src/lib/quizzes/quizParser";

describe("content validation rules", () => {
  it("rejects stub quiz explanations", async () => {
    const enQuizzes = await getAllQuizzesFromMdx("en");
    for (const quiz of enQuizzes) {
      for (const question of quiz.questions) {
        expect(question.explanation).not.toMatch(/ — correct\.$/);
        expect(question.explanation.length).toBeGreaterThan(40);
      }
    }
  });
});
