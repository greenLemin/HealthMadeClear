// @vitest-environment jsdom
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { STORAGE_KEYS } from "@/lib/preferences";

const wipeState = { generation: 0 };

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({ wipeGeneration: wipeState.generation }),
}));

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
    wipeState.generation = 0;
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

  it("uses a 24px checkbox and 48px row", () => {
    render(<VisitChecklistClient />);
    const checkbox = screen.getByLabelText("Item 1");
    expect(checkbox.className).toContain("h-6");
    expect(checkbox.className).toContain("w-6");
    expect(checkbox.closest("label")?.className).toContain("min-h-12");
  });

  it("skips persist writes after wipeGeneration increases", async () => {
    const { rerender } = render(<VisitChecklistClient />);
    fireEvent.click(screen.getByLabelText("Item 1"));

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEYS.checklist)).toContain("Item 1");
    });

    window.localStorage.removeItem(STORAGE_KEYS.checklist);
    wipeState.generation = 1;
    await act(async () => {
      rerender(<VisitChecklistClient />);
    });

    expect(window.localStorage.getItem(STORAGE_KEYS.checklist)).toBeNull();
  });
});
