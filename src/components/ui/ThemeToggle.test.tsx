// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "./ThemeToggle";

const mockSetTheme = vi.fn();
let mockTheme = "light";

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "switchToDark") return "Switch to dark theme";
    if (key === "switchToLight") return "Switch to light theme";
    return key;
  },
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "light";
  });

  it("renders with light theme state and focus-visible classes", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button.className).toContain("focus-visible:ring-2");
    expect(button.className).toContain("focus-visible:ring-primary");
  });

  it("toggles theme when clicked", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Switch to dark theme" });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("renders with dark theme state correctly", () => {
    mockTheme = "dark";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Switch to light theme" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "true");
  });
});
