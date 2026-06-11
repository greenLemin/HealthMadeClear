export type LessonSpec = {
  id: string;
  category: string;
  categoryId: string;
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  en: {
    title: string;
    description: string;
    sidebarTitle: string;
    sidebarTips: string[];
    body: string;
  };
  es: {
    title: string;
    description: string;
    sidebarTitle: string;
    sidebarTips: string[];
    body: string;
  };
  quiz: {
    enTitle: string;
    esTitle: string;
    enQuestions: {
      q: string;
      options: [string, string, string, string];
      answer: "A" | "B" | "C" | "D";
      explanation: string;
    }[];
    esQuestions: {
      q: string;
      options: [string, string, string, string];
      answer: "A" | "B" | "C" | "D";
      explanation: string;
    }[];
  };
};
