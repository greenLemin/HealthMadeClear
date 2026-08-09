// @vitest-environment jsdom
import { render, screen, act, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, beforeEach, vi } from "vitest";
import en from "@/messages/en.json";
import LanguageToggle from "./LanguageToggle";
import AppProviders from "./AppProviders";

const mockReplace = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/current-path",
  useRouter: () => ({
    replace: mockReplace,
  }),
  Link: ({
    children,
    onClick,
    onKeyDown,
    "aria-checked": ariaChecked,
    role,
    "aria-label": ariaLabel,
  }: any) => (
    <button
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      aria-checked={ariaChecked}
      aria-label={ariaLabel}
      data-testid="mock-link"
    >
      {children}
    </button>
  ),
}));

describe("LanguageToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  const renderComponent = () => {
    render(
      <NextIntlClientProvider locale="en" messages={en}>
        <AppProviders locale="en">
          <LanguageToggle />
        </AppProviders>
      </NextIntlClientProvider>
    );
  };

  it("renders correctly", () => {
    renderComponent();
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: en.nav.switchToEnglish })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: en.nav.switchToSpanish })).toBeInTheDocument();
  });

  it("updates locale on click", () => {
    renderComponent();
    const esButton = screen.getByRole("radio", { name: en.nav.switchToSpanish });

    act(() => {
      fireEvent.click(esButton);
    });

    expect(esButton).toHaveAttribute("aria-checked", "true");
  });

  it("switches locale and calls router.replace on ArrowRight keydown", () => {
    renderComponent();
    const enButton = screen.getByRole("radio", { name: en.nav.switchToEnglish });

    act(() => {
      fireEvent.keyDown(enButton, { key: "ArrowRight" });
    });

    expect(mockReplace).toHaveBeenCalledWith("/current-path", { locale: "es", scroll: false });
  });

  it("switches locale and calls router.replace on ArrowLeft keydown", () => {
    renderComponent();
    const enButton = screen.getByRole("radio", { name: en.nav.switchToEnglish });

    act(() => {
      fireEvent.keyDown(enButton, { key: "ArrowLeft" });
    });

    expect(mockReplace).toHaveBeenCalledWith("/current-path", { locale: "es", scroll: false });
  });

  it("switches locale and calls router.replace on ArrowUp keydown", () => {
    renderComponent();
    const enButton = screen.getByRole("radio", { name: en.nav.switchToEnglish });

    act(() => {
      fireEvent.keyDown(enButton, { key: "ArrowUp" });
    });

    expect(mockReplace).toHaveBeenCalledWith("/current-path", { locale: "es", scroll: false });
  });

  it("switches locale and calls router.replace on ArrowDown keydown", () => {
    renderComponent();
    const enButton = screen.getByRole("radio", { name: en.nav.switchToEnglish });

    act(() => {
      fireEvent.keyDown(enButton, { key: "ArrowDown" });
    });

    expect(mockReplace).toHaveBeenCalledWith("/current-path", { locale: "es", scroll: false });
  });

  it("does not switch if unsupported key is pressed", () => {
    renderComponent();
    const enButton = screen.getByRole("radio", { name: en.nav.switchToEnglish });

    act(() => {
      fireEvent.keyDown(enButton, { key: "Enter" });
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does not switch if next is the same locale", () => {
    renderComponent();
    const enButton = screen.getByRole("radio", { name: en.nav.switchToEnglish });

    act(() => {
      fireEvent.click(enButton);
    });

    expect(enButton).toHaveAttribute("aria-checked", "true");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
