import { describe, expect, it, vi } from "vitest";
import { getQuizByLessonId, getAllQuizzes } from "@/lib/localizedQuiz";

// Mock quizBundles to isolate and deterministically unit test quiz lookups
vi.mock("@/data/quizBundles", () => ({
  quizBundles: {
    en: [
      {
        id: "quiz-1-en",
        lessonId: "lesson-1",
        title: "Lesson 1 Quiz EN",
        description: "Quiz for lesson 1 in English",
        questions: [
          {
            id: "q1",
            question: "Question 1?",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Explanation 1",
          },
        ],
      },
      {
        id: "quiz-2-en",
        lessonId: "lesson-2",
        title: "Lesson 2 Quiz EN",
        description: "Quiz for lesson 2 in English",
        questions: [],
      },
    ],
    es: [
      {
        id: "quiz-1-es",
        lessonId: "lesson-1",
        title: "Lesson 1 Quiz ES",
        description: "Quiz for lesson 1 in Spanish",
        questions: [],
      },
    ],
  },
}));

describe("localizedQuiz", () => {
  describe("getQuizByLessonId", () => {
    it("returns the correct quiz matching lessonId for English locale", () => {
      const quiz = getQuizByLessonId("lesson-1", "en");
      expect(quiz).not.toBeNull();
      expect(quiz?.id).toBe("quiz-1-en");
      expect(quiz?.lessonId).toBe("lesson-1");
      expect(quiz?.title).toBe("Lesson 1 Quiz EN");
      expect(quiz?.questions).toHaveLength(1);
    });

    it("returns the correct quiz matching lessonId for Spanish locale", () => {
      const quiz = getQuizByLessonId("lesson-1", "es");
      expect(quiz).not.toBeNull();
      expect(quiz?.id).toBe("quiz-1-es");
      expect(quiz?.lessonId).toBe("lesson-1");
      expect(quiz?.title).toBe("Lesson 1 Quiz ES");
    });

    it("returns null when lessonId is not found in the locale", () => {
      const quizEn = getQuizByLessonId("nonexistent-lesson", "en");
      expect(quizEn).toBeNull();

      const quizEs = getQuizByLessonId("lesson-2", "es");
      expect(quizEs).toBeNull();
    });

    it("returns null when lessonId is empty", () => {
      const quiz = getQuizByLessonId("", "en");
      expect(quiz).toBeNull();
    });

    it("performs case-sensitive matching for lessonId", () => {
      const quiz = getQuizByLessonId("LESSON-1", "en");
      expect(quiz).toBeNull();
    });
  });

  describe("getAllQuizzes", () => {
    it("returns all quizzes for the requested English locale", () => {
      const quizzes = getAllQuizzes("en");
      expect(quizzes).toHaveLength(2);
      expect(quizzes[0].id).toBe("quiz-1-en");
      expect(quizzes[1].id).toBe("quiz-2-en");
    });

    it("returns all quizzes for the requested Spanish locale", () => {
      const quizzes = getAllQuizzes("es");
      expect(quizzes).toHaveLength(1);
      expect(quizzes[0].id).toBe("quiz-1-es");
    });
  });
});
