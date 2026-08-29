import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { PLANNER_DEFAULTS_BY_TYPE, useVisitPlanner } from "./useVisitPlanner";
import { STORAGE_KEYS } from "@/lib/preferences";
import type { PlannerQuestion, PlannerState } from "@/types/visitPlanner";

let mockWipeGeneration = 0;

vi.mock("@/components/AppProviders", () => ({
  useAppState: () => ({ wipeGeneration: mockWipeGeneration }),
}));

const EN_CATALOG: PlannerQuestion[] = [
  { id: "new-symptom:0", text: "What could be causing this symptom?" },
  { id: "new-symptom:1", text: "What tests do I need?" },
  { id: "new-symptom:2", text: "What are the treatment options?" },
  { id: "new-symptom:3", text: "When should I expect to feel better?" },
  { id: "medication:0", text: "Why am I taking this medicine?" },
  { id: "medication:1", text: "What side effects should I watch for?" },
  { id: "medication:2", text: "What should I do if I miss a dose?" },
  { id: "medication:3", text: "Can I take this with my other medicines?" },
  { id: "followup:0", text: "Is my treatment working as expected?" },
  { id: "followup:1", text: "Do I need any changes to my plan?" },
  { id: "followup:2", text: "What results should we review today?" },
  { id: "followup:3", text: "When should I follow up again?" },
];

describe("useVisitPlanner", () => {
  beforeEach(() => {
    mockWipeGeneration = 0;
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("uses visitType-matched defaults on first load", () => {
    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.hydrated).toBe(true);
    expect(result.current.visitType).toBe("new-symptom");
    expect(result.current.selectedQuestions).toEqual(["new-symptom:2", "new-symptom:3"]);
    expect(result.current.selectedQuestions).toEqual(PLANNER_DEFAULTS_BY_TYPE["new-symptom"]);
    expect(result.current.step).toBe(1);
    expect(result.current.customQuestions).toEqual([]);
    expect(result.current.notes).toBe("");
  });

  it("prefers v2 storage over v1", () => {
    const v1: PlannerState = {
      step: 1,
      visitType: "followup",
      selectedQuestions: ["followup:0"],
      notes: "v1 notes",
    };
    const v2: PlannerState = {
      step: 2,
      visitType: "medication",
      selectedQuestions: ["medication:1", "medication:3"],
      customQuestions: [{ id: "cq-1", text: "My custom q" }],
      notes: "v2 notes",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(v1));
    window.localStorage.setItem(STORAGE_KEYS.visitPlannerV2, JSON.stringify(v2));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.step).toBe(2);
    expect(result.current.visitType).toBe("medication");
    expect(result.current.selectedQuestions).toEqual(["medication:1", "medication:3"]);
    expect(result.current.customQuestions).toEqual([{ id: "cq-1", text: "My custom q" }]);
    expect(result.current.notes).toBe("v2 notes");
  });

  it("migrates v1 locale text to ids and copies customQuestions as-is", () => {
    const savedState: PlannerState = {
      step: 2,
      visitType: "medication",
      selectedQuestions: ["What side effects should I watch for?", "Gobbledygook unmapped", "medication:3"],
      customQuestions: [{ id: "cq-1", text: "My custom q" }],
      notes: "some notes",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.hydrated).toBe(true);
    expect(result.current.step).toBe(2);
    expect(result.current.visitType).toBe("medication");
    expect(result.current.selectedQuestions).toEqual(["medication:1", "medication:3"]);
    expect(result.current.customQuestions).toEqual([{ id: "cq-1", text: "My custom q" }]);
    expect(result.current.customQuestions).not.toContainEqual(
      expect.objectContaining({ text: "Gobbledygook unmapped" })
    );
    expect(result.current.notes).toBe("some notes");
  });

  it("does not delete the v1 key after writing v2", () => {
    const v1: PlannerState = {
      step: 1,
      visitType: "new-symptom",
      selectedQuestions: ["What are the treatment options?"],
      notes: "keep me",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(v1));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.selectedQuestions).toEqual(["new-symptom:2"]);
    const storedV1 = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.visitPlanner) || "{}");
    expect(storedV1.selectedQuestions).toEqual(["What are the treatment options?"]);
    expect(storedV1.notes).toBe("keep me");
    const storedV2 = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.visitPlannerV2) || "{}");
    expect(storedV2.selectedQuestions).toEqual(["new-symptom:2"]);
  });

  it("ignores invalid localStorage data and uses defaults", () => {
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify({ invalid: "data" }));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.selectedQuestions).toEqual(["new-symptom:2", "new-symptom:3"]);
    expect(result.current.step).toBe(1);
  });

  it("changeVisitType applies PLANNER_DEFAULTS_BY_TYPE for medication", () => {
    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    act(() => {
      result.current.changeVisitType("medication");
    });

    expect(result.current.visitType).toBe("medication");
    expect(result.current.selectedQuestions).toEqual(["medication:1", "medication:3"]);
  });

  it("toggleQuestion adds and removes question ids", () => {
    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    act(() => {
      result.current.toggleQuestion("new-symptom:0");
    });
    expect(result.current.selectedQuestions).toEqual(["new-symptom:2", "new-symptom:3", "new-symptom:0"]);

    act(() => {
      result.current.toggleQuestion("new-symptom:2");
    });
    expect(result.current.selectedQuestions).toEqual(["new-symptom:3", "new-symptom:0"]);
  });

  it("addCustomQuestion adds a new question if not empty and not duplicate", () => {
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    act(() => {
      result.current.setCustomInput("  New Question  ");
    });
    act(() => {
      result.current.addCustomQuestion();
    });

    expect(result.current.customQuestions).toHaveLength(1);
    expect(result.current.customQuestions[0]).toEqual({
      id: "cq-1672531200000",
      text: "New Question",
    });
    expect(result.current.customInput).toBe("");

    act(() => {
      result.current.setCustomInput("new question");
    });
    act(() => {
      result.current.addCustomQuestion();
    });
    expect(result.current.customQuestions).toHaveLength(1);

    act(() => {
      result.current.setCustomInput("   ");
    });
    act(() => {
      result.current.addCustomQuestion();
    });
    expect(result.current.customQuestions).toHaveLength(1);
  });

  it("removeCustomQuestion removes a question by id", () => {
    const savedState: PlannerState = {
      step: 1,
      visitType: "new-symptom",
      selectedQuestions: ["new-symptom:2"],
      customQuestions: [
        { id: "cq-1", text: "Q1" },
        { id: "cq-2", text: "Q2" },
      ],
      notes: "",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlannerV2, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    act(() => {
      result.current.removeCustomQuestion("cq-1");
    });

    expect(result.current.customQuestions).toEqual([{ id: "cq-2", text: "Q2" }]);
  });

  it("persists ids to the v2 key when state changes", () => {
    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    act(() => {
      result.current.setStep(2);
      result.current.setNotes("test note");
    });

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.visitPlannerV2) || "{}");
    expect(stored).toMatchObject({
      step: 2,
      notes: "test note",
      selectedQuestions: ["new-symptom:2", "new-symptom:3"],
      visitType: "new-symptom",
      customQuestions: [],
    });
    expect(window.localStorage.getItem(STORAGE_KEYS.visitPlanner)).toBeNull();
  });

  it("handles null value in localStorage parse", () => {
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, "null");

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.selectedQuestions).toEqual(["new-symptom:2", "new-symptom:3"]);
  });

  it("handles invalid visitType in localStorage parse", () => {
    const savedState = {
      step: 1,
      visitType: "invalid-type",
      selectedQuestions: [],
      notes: "",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.selectedQuestions).toEqual(["new-symptom:2", "new-symptom:3"]);
    expect(result.current.visitType).toBe("new-symptom");
  });

  it("handles partial/invalid fields in localStorage parse gracefully", () => {
    const savedState = {
      visitType: "new-symptom",
      step: 99,
      selectedQuestions: "not an array",
      notes: 12345,
      customQuestions: [null, "not an object", { id: "valid", text: "valid text" }],
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.step).toBe(1);
    expect(result.current.selectedQuestions).toEqual([]);
    expect(result.current.notes).toBe("");
    expect(result.current.customQuestions).toEqual([{ id: "valid", text: "valid text" }]);
  });

  it("handles missing customQuestions gracefully", () => {
    const savedState = {
      step: 1,
      visitType: "new-symptom",
      selectedQuestions: ["new-symptom:2"],
      notes: "",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlannerV2, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(EN_CATALOG));

    expect(result.current.customQuestions).toEqual([]);
  });

  it("resets in-memory planner state when wipeGeneration increases", () => {
    const { result, rerender } = renderHook(() => useVisitPlanner(EN_CATALOG));

    act(() => {
      result.current.setNotes("keep");
      result.current.changeVisitType("medication");
    });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.visitPlannerV2) || "{}").notes).toBe("keep");
    expect(result.current.visitType).toBe("medication");

    window.localStorage.removeItem(STORAGE_KEYS.visitPlannerV2);
    mockWipeGeneration = 1;
    act(() => {
      rerender();
    });

    expect(result.current.notes).toBe("");
    expect(result.current.visitType).toBe("new-symptom");
    expect(result.current.step).toBe(1);
    expect(result.current.selectedQuestions).toEqual(PLANNER_DEFAULTS_BY_TYPE["new-symptom"]);
    const stored = window.localStorage.getItem(STORAGE_KEYS.visitPlannerV2);
    expect(stored ?? "").not.toContain("keep");
  });
});
