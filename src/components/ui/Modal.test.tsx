import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Modal from "./Modal";
import React from "react";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("Modal Component", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: "Test Modal",
    children: <div>Modal Content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when isOpen is false", () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the modal when isOpen is true", () => {
    render(<Modal {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    const titleId = `modal-test-modal`;
    expect(dialog).toHaveAttribute("aria-labelledby", titleId);

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("calls onClose when dismiss button is clicked", () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByLabelText("dismiss");
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(<Modal {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other key presses", () => {
    render(<Modal {...defaultProps} />);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    render(<Modal {...defaultProps} />);
    const backdrops = document.querySelectorAll('div[aria-hidden="true"]');
    if (backdrops.length > 0) {
      fireEvent.click(backdrops[0]);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    } else {
      throw new Error("Backdrop not found");
    }
  });
});
