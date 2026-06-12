export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  correctIndex?: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  passScore: number;
  questions: QuizQuestion[];
}
