// @vitest-environment jsdom
import { render, screen, act, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi } from "vitest";
import en from "@/messages/en.json";
import ThemeToggle from "./ThemeToggle";

const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({
    theme: mockTheme,
    setTheme: (newTheme: string) => {
      mockTheme = newTheme;
      mockSetTheme(newTheme);
    },
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
  });

  const renderComponent = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ThemeToggle />
      </NextIntlClientProvider>
    );
  };

  it("renders with light mode active initially and correct accessibility attributes", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: en.accessibility.switchToDark });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveAttribute("title", en.accessibility.switchToDark);
    expect(button.className).toContain("focus-visible:ring-2");
    expect(button.className).toContain("focus-visible:ring-primary");
  });

  it("toggles theme state on click and calls setTheme", () => {
    renderComponent();
    const button = screen.getByRole("button", { name: en.accessibility.switchToDark });

    act(() => {
      fireEvent.click(button);
    });

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
