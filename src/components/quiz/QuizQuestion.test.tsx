import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import QuizQuestion from "./QuizQuestion";
import type { QuizQuestion as QuizQuestionType } from "@/types/quiz";

const mockQuestion: QuizQuestionType = {
  id: "q1",
  question: "What is the primary function of the heart?",
  options: [
    "To pump blood throughout the body",
    "To digest food",
    "To filter waste from the blood",
    "To produce oxygen",
  ],
  correctAnswer: "A",
  correctIndex: 0,
  explanation: "The heart pumps blood to all parts of the body.",
};

describe("QuizQuestion", () => {
  it("renders the question and all options", () => {
    render(<QuizQuestion question={mockQuestion} selectedIndex={null} onSelect={() => {}} />);

    expect(screen.getByText(mockQuestion.question)).toBeDefined();
    mockQuestion.options.forEach((option) => {
      expect(screen.getByText(option)).toBeDefined();
    });
  });

  it("calls onSelect with the correct index when an option is clicked", () => {
    const handleSelect = vi.fn();
    render(<QuizQuestion question={mockQuestion} selectedIndex={null} onSelect={handleSelect} />);

    const radioInput = screen.getAllByRole("radio")[1];
    fireEvent.click(radioInput);

    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it("displays as disabled when the disabled prop is true", () => {
    render(<QuizQuestion question={mockQuestion} selectedIndex={null} onSelect={() => {}} disabled={true} />);

    const radioInputs = screen.getAllByRole("radio");
    radioInputs.forEach((input) => {
      expect((input as HTMLInputElement).disabled).toBe(true);
    });
  });

  it("correctly identifies the selected option", () => {
    render(<QuizQuestion question={mockQuestion} selectedIndex={2} onSelect={() => {}} />);

    const radioInputs = screen.getAllByRole("radio");
    expect((radioInputs[0] as HTMLInputElement).checked).toBe(false);
    expect((radioInputs[1] as HTMLInputElement).checked).toBe(false);
    expect((radioInputs[2] as HTMLInputElement).checked).toBe(true);
    expect((radioInputs[3] as HTMLInputElement).checked).toBe(false);
  });

  it("parses and renders bold and italic text in options correctly", () => {
    const questionWithFormatting: QuizQuestionType = {
      ...mockQuestion,
      options: [
        "Normal text",
        "Text with **bold** word",
        "Text with *italic* word",
        "Text with _another italic_ word",
      ],
    };

    const { container } = render(
      <QuizQuestion question={questionWithFormatting} selectedIndex={null} onSelect={() => {}} />
    );

    expect(screen.getByText("Normal text")).toBeDefined();

    const boldElement = container.querySelector("strong");
    expect(boldElement).toBeDefined();
    expect(boldElement?.textContent).toBe("bold");

    const italicElements = container.querySelectorAll("em");
    expect(italicElements.length).toBe(2);
    expect(italicElements[0].textContent).toBe("italic");
    expect(italicElements[1].textContent).toBe("another italic");
  });
});
