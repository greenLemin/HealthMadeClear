import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import InlineGlossaryTerm from "./InlineGlossaryTerm";
import { NextIntlClientProvider } from "next-intl";

// Mock next-intl Link component
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, onClick }: any) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
      }}
      data-testid="mock-link"
    >
      {children}
    </a>
  ),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe("InlineGlossaryTerm", () => {
  const mockTerm = {
    id: "test-term",
    term: "Test Term",
    definition: "This is a test definition for the test term.",
  };

  const renderComponent = (props: any = {}) => {
    return render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          glossary: { termDefinitionAria: "Definition for {term}", viewTerm: "View term" },
          common: { dismiss: "Dismiss" },
        }}
      >
        <InlineGlossaryTerm term={mockTerm} displayText="Test Display" {...props} />
      </NextIntlClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger button with display text", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Test Display");
  });

  it("opens popover on click and shows term definition", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });

    // Initial state: popover closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Click to open
    fireEvent.click(button);

    // Popover should be visible
    const popover = await screen.findByRole("dialog");
    expect(popover).toBeInTheDocument();
    expect(screen.getByText("Test Term")).toBeInTheDocument();
    expect(screen.getByText("This is a test definition for the test term.")).toBeInTheDocument();
  });

  it("closes popover when escape key is pressed", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    fireEvent.click(button);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes popover when clicking outside", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    fireEvent.click(button);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("handles keyboard interaction (Enter key) to toggle popover", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });

    button.focus();
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("closes popover when close button is clicked", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    fireEvent.click(button);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes popover when scrolling", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    fireEvent.click(button);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.scroll(window);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("closes popover when link inside popover is clicked", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    fireEvent.click(button);

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    const link = screen.getByTestId("mock-link");
    fireEvent.click(link);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("handles space key to toggle popover", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });

    button.focus();
    fireEvent.keyDown(button, { key: " ", code: "Space" });

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("focuses popover when opened", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });
    fireEvent.click(button);

    const popover = await screen.findByRole("dialog");
    expect(popover).toBeInTheDocument();

    await waitFor(() => {
      expect(document.activeElement).toBe(popover);
    });
  });

  it("returns focus to button when closed", async () => {
    renderComponent();
    const button = screen.getByRole("button", { name: "Definition for Test Display" });

    button.focus();
    expect(document.activeElement).toBe(button);

    fireEvent.click(button);
    const popover = await screen.findByRole("dialog");

    await waitFor(() => {
      expect(document.activeElement).toBe(popover);
    });

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
  });
});
