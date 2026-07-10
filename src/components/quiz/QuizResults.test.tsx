/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QuizResults from "./QuizResults";
import { render } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, options?: any) => {
    if (key === "scoreLabel" && options) {
      return `scoreLabel ${options.score} ${options.correct} ${options.total}`;
    }
    return key;
  },
}));

describe("QuizResults", () => {
  const mockQuiz = {
    id: "test-quiz",
    lessonId: "test-lesson",
    title: "Test Quiz",
    passScore: 80,
    questions: [
      {
        question: "Question 1?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "B" as const,
        explanation: "Explanation 1",
      },
      {
        question: "Question 2?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "C" as const,
        explanation: "Explanation 2",
      },
    ],
  };

  const defaultProps = {
    quiz: mockQuiz,
    answers: [1, 2], // Both correct
    score: 100,
    passed: true,
    onRetake: vi.fn(),
    onContinue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly for a passing score", () => {
    render(<QuizResults {...defaultProps} />);

    expect(screen.getByText("Test Quiz")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("passed")).toBeInTheDocument();
    expect(screen.getByText("continue")).toBeInTheDocument();
    expect(screen.getByText("retake")).toBeInTheDocument();

    // Check if questions and explanations are rendered
    expect(screen.getByText("Question 1?")).toBeInTheDocument();
    expect(screen.getByText("Question 2?")).toBeInTheDocument();
    expect(screen.getByText("Explanation 1")).toBeInTheDocument();
    expect(screen.getByText("Explanation 2")).toBeInTheDocument();
  });

  it("renders correctly for a failing score", () => {
    const props = {
      ...defaultProps,
      answers: [0, 0], // Both incorrect
      score: 0,
      passed: false,
    };
    render(<QuizResults {...props} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("tryAgain")).toBeInTheDocument();
    expect(screen.queryByText("continue")).not.toBeInTheDocument();
    expect(screen.getByText("retake")).toBeInTheDocument();
  });

  it("calls onRetake when the retake button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /retake/i }));
    expect(defaultProps.onRetake).toHaveBeenCalledTimes(1);
  });

  it("calls onContinue when the continue button is clicked", async () => {
    const user = userEvent.setup();
    render(<QuizResults {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(defaultProps.onContinue).toHaveBeenCalledTimes(1);
  });
});
