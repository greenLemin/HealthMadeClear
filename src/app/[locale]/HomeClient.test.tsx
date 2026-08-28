// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import HomeClient from "./HomeClient";
import { useMotionSafe } from "@/hooks/useMotionSafe";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({
    completedLessons: new Set<string>(),
    recentLessons: [] as string[],
    locale: "en",
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/hooks/useMotionSafe", () => ({
  useMotionSafe: vi.fn(() => false),
}));

vi.mock("@/components/SectionNav", () => ({
  default: () => <div data-testid="section-nav" />,
}));

vi.mock("@/components/home/HomeIntro", () => ({
  default: () => null,
}));

vi.mock("@/components/home/HomeMission", () => ({
  default: () => null,
}));

vi.mock("@/components/home/HomeFeaturedPaths", () => ({
  default: () => null,
}));

vi.mock("@/components/home/HomeTools", () => ({
  default: () => null,
}));

vi.mock("@/components/home/HomeCta", () => ({
  default: () => null,
}));

vi.mock("@/components/Callout", () => ({
  default: () => null,
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => null,
}));

beforeAll(() => {
  const MockIntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  (window as unknown as { IntersectionObserver: typeof MockIntersectionObserver }).IntersectionObserver =
    MockIntersectionObserver;
});

function renderHome() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <HomeClient lessons={[]} learningPaths={[]} />
    </NextIntlClientProvider>
  );
}

describe("HomeClient", () => {
  it("renders Hero before the home video and never preloads it", () => {
    vi.mocked(useMotionSafe).mockReturnValue(false);
    const { container } = renderHome();

    const heroHeading = screen.getByRole("heading", { level: 1 });
    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video).toHaveAttribute("src", "/HMC_Video.mp4");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("poster", "/hmc-video-poster.jpg");
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveProperty("playsInline", true);
    expect(video).toHaveAttribute("autoplay");

    expect(heroHeading.compareDocumentPosition(video as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );

    const cta = screen.getByRole("link", { name: en.hero.startLearning });
    expect(cta.compareDocumentPosition(video as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("does not autoplay when prefers-reduced-motion is reduce", () => {
    vi.mocked(useMotionSafe).mockReturnValue(true);
    const { container } = renderHome();

    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("poster", "/hmc-video-poster.jpg");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).toHaveProperty("autoplay", false);
  });
});
