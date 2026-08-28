// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import QuizFeedback from "./QuizFeedback";

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function renderFeedback(props: { showResult: boolean; correct: boolean | null; explanation?: string }) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <QuizFeedback showResult={props.showResult} correct={props.correct} explanation={props.explanation} />
    </NextIntlClientProvider>
  );
}

describe("QuizFeedback", () => {
  afterEach(() => {
    cleanup();
  });

  it("always keeps the min-h-[140px] wrapper in the document", () => {
    const { container, rerender } = renderFeedback({ showResult: false, correct: null });

    expect(container.querySelector(".min-h-\\[140px\\]")).toBeTruthy();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <QuizFeedback showResult={true} correct={true} explanation="Because." />
      </NextIntlClientProvider>
    );

    expect(container.querySelector(".min-h-\\[140px\\]")).toBeTruthy();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders no alert until showResult", () => {
    renderFeedback({ showResult: false, correct: true, explanation: "Hidden." });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("Hidden.")).not.toBeInTheDocument();
  });

  it("shows correct copy and explanation when showResult", () => {
    renderFeedback({ showResult: true, correct: true, explanation: "Right reason." });
    expect(screen.getByRole("alert")).toHaveTextContent(en.quiz.correct);
    expect(screen.getByText("Right reason.")).toBeInTheDocument();
  });

  it("shows incorrect copy when the answer is wrong", () => {
    renderFeedback({ showResult: true, correct: false, explanation: "Wrong reason." });
    expect(screen.getByRole("alert")).toHaveTextContent(en.quiz.incorrect);
    expect(screen.getByText("Wrong reason.")).toBeInTheDocument();
  });
});
