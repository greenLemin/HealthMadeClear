import { describe, expect, it } from "vitest";
import { isQuizPassed, normalizeStoredScore, quizIdsForLesson, toPercent } from "./quizScore";

describe("normalizeStoredScore", () => {
  it("converts percent-in-score 80/5 to 4/5", () => {
    expect(normalizeStoredScore(80, 5)).toEqual({ score: 4, maxScore: 5 });
  });

  it("leaves valid count/count 4/5 unchanged", () => {
    expect(normalizeStoredScore(4, 5)).toEqual({ score: 4, maxScore: 5 });
  });

  it("leaves valid count/count 8/10 unchanged", () => {
    expect(normalizeStoredScore(8, 10)).toEqual({ score: 8, maxScore: 10 });
  });

  it("leaves 80/100 unchanged (score < max)", () => {
    expect(normalizeStoredScore(80, 100)).toEqual({ score: 80, maxScore: 100 });
  });

  it("converts percent-in-both 60/60 to 36/60", () => {
    expect(normalizeStoredScore(60, 60)).toEqual({ score: 36, maxScore: 60 });
  });
});

describe("isQuizPassed / toPercent", () => {
  it("isQuizPassed(4, 5) is true", () => {
    expect(isQuizPassed(4, 5)).toBe(true);
  });

  it("isQuizPassed(1, 5) is false", () => {
    expect(isQuizPassed(1, 5)).toBe(false);
  });

  it("toPercent(4, 5) === 80", () => {
    expect(toPercent(4, 5)).toBe(80);
  });
});

describe("quizIdsForLesson", () => {
  it("returns live id and legacy -quiz suffix", () => {
    expect(quizIdsForLesson("understanding-prescription-labels")).toEqual([
      "understanding-prescription-labels",
      "understanding-prescription-labels-quiz",
    ]);
  });
});
