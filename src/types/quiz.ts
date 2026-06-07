export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  passScore: number;
  questions: QuizQuestion[];
}
