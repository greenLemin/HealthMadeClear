// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import PrintButton from "./PrintButton";

function renderPrintButton() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <PrintButton />
    </NextIntlClientProvider>
  );
}

describe("PrintButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls window.print on click", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    renderPrintButton();

    const button = screen.getByRole("button", { name: en.common.print });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", en.common.print);
    expect(button.className).toMatch(/\bno-print\b/);
    expect(button.className).toMatch(/min-h-\[56px\]|min-h-11/);

    fireEvent.click(button);
    expect(print).toHaveBeenCalledTimes(1);
  });
});
