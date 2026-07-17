/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/script", () => ({
  default: ({ children, id, src, strategy, ...props }: any) => (
    <script id={id} src={src} data-strategy={strategy} {...props}>
      {children}
    </script>
  ),
}));

import GoogleAnalytics from "./GoogleAnalytics";

describe("GoogleAnalytics", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing when NODE_ENV is not production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-12345");

    const { container } = render(<GoogleAnalytics />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when NEXT_PUBLIC_GA_MEASUREMENT_ID is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "");

    const { container } = render(<GoogleAnalytics />);
    expect(container.firstChild).toBeNull();
  });

  it("renders Script tags when in production and measurement ID is present", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID", "G-1234567890");

    const { container } = render(<GoogleAnalytics />);
    const scripts = container.querySelectorAll("script");

    expect(scripts.length).toBe(2);

    // First script
    expect(scripts[0]).toHaveAttribute("src", "https://www.googletagmanager.com/gtag/js?id=G-1234567890");
    expect(scripts[0]).toHaveAttribute("data-strategy", "afterInteractive");

    // Second script
    expect(scripts[1]).toHaveAttribute("id", "google-analytics");
    expect(scripts[1]).toHaveAttribute("data-strategy", "afterInteractive");
    expect(scripts[1].innerHTML).toContain("gtag('config', 'G-1234567890'");
    expect(scripts[1].innerHTML).toContain("window.dataLayer = window.dataLayer || []");
  });
});
