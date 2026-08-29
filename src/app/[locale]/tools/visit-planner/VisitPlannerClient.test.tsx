// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { PlannerQuestion } from "@/types/visitPlanner";
import { useVisitPlanner } from "./useVisitPlanner";
import VisitPlannerClient from "./VisitPlannerClient";

vi.mock("./useVisitPlanner", () => ({
  useVisitPlanner: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

vi.mock("@/components/MedicalDisclaimer", () => ({
  default: () => null,
}));

vi.mock("@/components/ui/Reveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

type PlannerHook = ReturnType<typeof useVisitPlanner>;

function makePlanner(overrides: Partial<PlannerHook> = {}): PlannerHook {
  return {
    step: 1,
    setStep: vi.fn(),
    visitType: "new-symptom",
    setVisitType: vi.fn(),
    changeVisitType: vi.fn(),
    selectedQuestions: ["new-symptom:2", "new-symptom:3"],
    setSelectedQuestions: vi.fn(),
    toggleQuestion: vi.fn(),
    customQuestions: [],
    setCustomQuestions: vi.fn(),
    customInput: "",
    setCustomInput: vi.fn(),
    addCustomQuestion: vi.fn(),
    removeCustomQuestion: vi.fn(),
    notes: "",
    setNotes: vi.fn(),
    hydrated: true,
    ...overrides,
  };
}

function renderPlanner() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <VisitPlannerClient />
    </NextIntlClientProvider>
  );
}

describe("VisitPlannerClient", () => {
  beforeEach(() => {
    vi.mocked(useVisitPlanner).mockReset();
  });

  it("disables visit-type controls and Next while not hydrated", () => {
    vi.mocked(useVisitPlanner).mockReturnValue(makePlanner({ hydrated: false }));
    renderPlanner();

    const continueBtn = screen.getByRole("button", { name: en.common.continue });
    const typeBtn = screen.getByRole("button", { name: /New symptom/i });
    expect(continueBtn.closest("[inert]")).not.toBeNull();
    expect(typeBtn.closest("[inert]")).not.toBeNull();
    expect(continueBtn.closest("[aria-busy='true']")).not.toBeNull();
    expect(continueBtn).toBeDisabled();
    expect(typeBtn).toBeDisabled();

    const stepButtons = screen.getAllByRole("button", { name: /Step 1|Step 2|Step 3/i });
    for (const button of stepButtons) {
      expect(button).toBeDisabled();
    }
  });

  it("advances from step 1 to 2 and focuses the step heading", () => {
    const setStep = vi.fn();
    const state = makePlanner({ step: 1, setStep, hydrated: true });
    vi.mocked(useVisitPlanner).mockReturnValue(state);

    const view = renderPlanner();
    fireEvent.click(screen.getByRole("button", { name: en.common.continue }));
    expect(setStep).toHaveBeenCalledWith(2);

    vi.mocked(useVisitPlanner).mockReturnValue({ ...state, step: 2 });
    view.rerender(
      <NextIntlClientProvider locale="en" messages={en}>
        <VisitPlannerClient />
      </NextIntlClientProvider>
    );

    expect(document.activeElement).toHaveAttribute("tabindex", "-1");
    expect(document.activeElement).toHaveTextContent(en.tools.selectQuestions);
  });

  it("passes locale-stable question ids into the hook catalog", () => {
    vi.mocked(useVisitPlanner).mockReturnValue(makePlanner());
    renderPlanner();

    const catalog = vi.mocked(useVisitPlanner).mock.calls[0]?.[0] as PlannerQuestion[];
    expect(catalog[0]).toEqual({
      id: "new-symptom:0",
      text: en.tools.plannerQuestions["new-symptom"][0],
    });
    expect(catalog.some((q) => q.id === "medication:1")).toBe(true);
    expect(catalog.some((q) => q.id === "followup:3")).toBe(true);
  });

  it("resolves selected ids to current locale catalog text on step 2", () => {
    vi.mocked(useVisitPlanner).mockReturnValue(makePlanner({ step: 2, hydrated: true }));
    renderPlanner();

    const treatment = screen.getByRole("checkbox", { name: /treatment options/i });
    const timeline = screen.getByRole("checkbox", { name: /expect to feel better/i });
    const cause = screen.getByRole("checkbox", { name: /causing this symptom/i });
    expect(treatment).toBeChecked();
    expect(timeline).toBeChecked();
    expect(cause).not.toBeChecked();
  });

  it("resolves selected ids to Spanish catalog text on step 2", () => {
    vi.mocked(useVisitPlanner).mockReturnValue(makePlanner({ step: 2, hydrated: true }));
    render(
      <NextIntlClientProvider locale="es" messages={es}>
        <VisitPlannerClient />
      </NextIntlClientProvider>
    );

    const treatment = screen.getByRole("checkbox", {
      name: new RegExp(es.tools.plannerQuestions["new-symptom"][2]!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    });
    const timeline = screen.getByRole("checkbox", {
      name: new RegExp(es.tools.plannerQuestions["new-symptom"][3]!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    });
    expect(treatment).toBeChecked();
    expect(timeline).toBeChecked();
  });

  it("renders step 3 summary with resolved question text and contrast classes", () => {
    vi.mocked(useVisitPlanner).mockReturnValue(makePlanner({ step: 3, hydrated: true }));
    const { container } = renderPlanner();

    expect(screen.getByText(en.tools.plannerQuestions["new-symptom"][2]!)).toBeInTheDocument();
    expect(screen.getByText(en.tools.plannerQuestions["new-symptom"][3]!)).toBeInTheDocument();
    const summary = container.querySelector(".border-2.border-primary\\/20");
    expect(summary).toHaveClass(
      "bg-surface-container-lowest",
      "shadow-elevation-2",
      "print:border-neutral-900"
    );
  });
});
