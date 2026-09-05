import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ScrollToTop from "./ScrollToTop";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => (key === "backToTop" ? "Back to top" : key),
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
}));

describe("ScrollToTop", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    window.scrollTo = vi.fn();
  });

  it("does not render when scrollY is <= 400", () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders with aria-label and title when scrolled past threshold (> 400)", () => {
    render(<ScrollToTop />);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button", { name: "Back to top" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Back to top");
    expect(button).toHaveAttribute("aria-label", "Back to top");
  });

  it("triggers window.scrollTo when clicked", () => {
    render(<ScrollToTop />);

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button", { name: "Back to top" });
    fireEvent.click(button);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
