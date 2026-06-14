import { describe, expect, it } from "vitest";
import { getQuizByLessonId, getAllQuizzes } from "@/lib/localizedQuiz";

describe("localizedQuiz", () => {
  describe("getQuizByLessonId", () => {
    it("returns an English quiz for a known lessonId when locale is en", () => {
      const quiz = getQuizByLessonId("understanding-prescription-labels", "en");
      expect(quiz).toBeDefined();
      expect(quiz?.lessonId).toBe("understanding-prescription-labels");
      expect(quiz?.title).toBe("Understanding Prescription Labels Quiz");
    });

    it("returns a Spanish quiz for a known lessonId when locale is es", () => {
      const quiz = getQuizByLessonId("understanding-prescription-labels", "es");
      expect(quiz).toBeDefined();
      expect(quiz?.lessonId).toBe("understanding-prescription-labels");
      expect(quiz?.title).toBe("Cuestionario: Entendiendo las etiquetas de recetas");
    });

    it("returns null for an unknown lessonId", () => {
      const quiz = getQuizByLessonId("nonexistent-lesson", "en");
      expect(quiz).toBeNull();
    });
  });

  describe("getAllQuizzes", () => {
    it("returns all English quizzes when locale is en", () => {
      const quizzes = getAllQuizzes("en");
      expect(quizzes).toBeDefined();
      expect(quizzes.length).toBeGreaterThan(0);
      expect(quizzes[0].title).toBe("Understanding Prescription Labels Quiz");
    });

    it("returns all Spanish quizzes when locale is es", () => {
      const quizzes = getAllQuizzes("es");
      expect(quizzes).toBeDefined();
      expect(quizzes.length).toBeGreaterThan(0);
      expect(quizzes[0].title).toBe("Cuestionario: Entendiendo las etiquetas de recetas");
    });
  });
});
