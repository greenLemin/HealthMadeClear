import { render, screen } from "@testing-library/react";
import SectionNav from "./SectionNav";
import { vi, describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  const MockIntersectionObserver = vi.fn();
  MockIntersectionObserver.prototype.observe = () => null;
  MockIntersectionObserver.prototype.unobserve = () => null;
  MockIntersectionObserver.prototype.disconnect = () => null;
  global.IntersectionObserver = MockIntersectionObserver as any;
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("SectionNav", () => {
  it("renders correctly", () => {
    render(<SectionNav />);
    expect(screen.getByText("findRightResource")).toBeInTheDocument();
    expect(screen.getByText("exploreByGoal")).toBeInTheDocument();
  });

  it("renders all sections", () => {
    render(<SectionNav />);
    expect(screen.getByText("pathsTitle")).toBeInTheDocument();
    expect(screen.getByText("learnTitle")).toBeInTheDocument();
    expect(screen.getByText("glossaryTitle")).toBeInTheDocument();
    expect(screen.getByText("toolsTitle")).toBeInTheDocument();
  });
});
