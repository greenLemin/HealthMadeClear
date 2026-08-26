// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next-intl", () => {
  const mockTranslations = (key: string, params?: Record<string, unknown>) => {
    if (key === "checklistItems") return ["Item 1", "Item 2", "Item 3"];
    if (key === "itemsCompletedCount") return `${params?.completed} of ${params?.total} completed`;
    return key;
  };
  mockTranslations.raw = (key: string) => {
    if (key === "checklistItems") return ["Item 1", "Item 2", "Item 3"];
    return [];
  };
  return {
    useTranslations: () => mockTranslations,
  };
});

import VisitChecklistClient from "./VisitChecklistClient";

describe("VisitChecklistClient", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders checklist items and toggles checked state", () => {
    render(<VisitChecklistClient />);
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();

    const checkbox1 = screen.getByLabelText("Item 1") as HTMLInputElement;
    expect(checkbox1.checked).toBe(false);

    fireEvent.click(checkbox1);
    expect(checkbox1.checked).toBe(true);
  });
});
