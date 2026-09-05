// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import ScrollToTop from "./ScrollToTop";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/learn",
}));

describe("ScrollToTop", () => {
  const renderComponent = () => {
    return render(
      <NextIntlClientProvider locale="en" messages={en}>
        <ScrollToTop />
      </NextIntlClientProvider>
    );
  };

  it("is hidden when window.scrollY <= 400 and visible when window.scrollY > 400", () => {
    renderComponent();

    expect(screen.queryByRole("button", { name: en.common.backToTop })).not.toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button", { name: en.common.backToTop });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", en.common.backToTop);
    expect(button).toHaveAttribute("aria-label", en.common.backToTop);
  });

  it("scrolls to top when clicked", () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;

    renderComponent();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button", { name: en.common.backToTop });
    fireEvent.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
