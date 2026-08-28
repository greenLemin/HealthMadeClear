// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import type { Quiz } from "@/types/quiz";
import QuizClient from "./QuizClient";

const saveQuizAttempt = vi.fn().mockResolvedValue(undefined);

vi.mock("@/hooks/useProgress", () => ({
  useProgress: () => ({
    saveQuizAttempt,
    getQuizBestScore: () => null,
  }),
}));

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({ locale: "en" }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => null,
}));

vi.mock("@/components/quiz/Confetti", () => ({
  default: () => null,
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const quiz: Quiz = {
  id: "understanding-prescription-labels",
  lessonId: "understanding-prescription-labels",
  title: "Prescription labels",
  passScore: 70,
  questions: [
    {
      question: "Question one?",
      options: ["Right", "Wrong"],
      correctAnswer: "A",
      explanation: "One.",
    },
    {
      question: "Question two?",
      options: ["Right", "Wrong"],
      correctAnswer: "A",
      explanation: "Two.",
    },
  ],
};

function renderQuiz() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QuizClient
        quiz={quiz}
        lessonTitle="Prescription labels"
        lessonId="understanding-prescription-labels"
      />
    </NextIntlClientProvider>
  );
}

describe("QuizClient question render", () => {
  afterEach(() => {
    cleanup();
    saveQuizAttempt.mockClear();
  });

  it("renders question title from fixture after start", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: en.quiz.startQuiz }));

    expect(screen.getByRole("heading", { name: "Prescription labels" })).toBeInTheDocument();
    expect(screen.getByText("Question one?")).toBeInTheDocument();
  });
});

describe("QuizClient persist units", () => {
  afterEach(() => {
    cleanup();
    saveQuizAttempt.mockClear();
  });

  it("calls saveQuizAttempt with correctCount and questionCount, not UI percent", async () => {
    const user = userEvent.setup();
    renderQuiz();

    await user.click(screen.getByRole("button", { name: en.quiz.startQuiz }));

    await user.click(screen.getByRole("radio", { name: "Right" }));
    await user.click(screen.getByRole("button", { name: en.quiz.checkAnswer }));
    await user.click(screen.getByRole("button", { name: en.quiz.next }));

    await user.click(screen.getByRole("radio", { name: "Wrong" }));
    await user.click(screen.getByRole("button", { name: en.quiz.checkAnswer }));
    await user.click(screen.getByRole("button", { name: en.quiz.seeResults }));

    await waitFor(() => {
      expect(saveQuizAttempt).toHaveBeenCalledWith(
        "understanding-prescription-labels",
        "understanding-prescription-labels",
        1,
        2,
        [0, 1]
      );
    });
    expect(saveQuizAttempt).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      50,
      2,
      expect.anything()
    );
    expect(saveQuizAttempt).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      80,
      5,
      expect.anything()
    );
  });
});
