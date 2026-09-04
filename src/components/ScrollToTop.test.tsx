// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import ScrollToTop from "./ScrollToTop";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/learn",
}));

function renderScrollToTop() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ScrollToTop />
    </NextIntlClientProvider>
  );
}

describe("ScrollToTop", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not render when window.scrollY <= 400", () => {
    window.scrollY = 100;
    renderScrollToTop();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders when window.scrollY > 400 and has correct title tooltip and aria-label", () => {
    window.scrollY = 500;
    renderScrollToTop();
    fireEvent.scroll(window);

    const button = screen.getByRole("button", { name: en.common.backToTop });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", en.common.backToTop);
    expect(button).toHaveAttribute("title", en.common.backToTop);
  });

  it("calls window.scrollTo with top: 0 when clicked", () => {
    window.scrollY = 500;
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    renderScrollToTop();
    fireEvent.scroll(window);

    const button = screen.getByRole("button", { name: en.common.backToTop });
    fireEvent.click(button);

    expect(scrollToMock).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });
});
