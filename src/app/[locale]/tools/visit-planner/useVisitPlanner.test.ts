import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVisitPlanner } from "./useVisitPlanner";
import { STORAGE_KEYS } from "@/lib/preferences";
import type { PlannerState } from "./types";

describe("useVisitPlanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("initializes with default questions when no storage exists", () => {
    const { result } = renderHook(() => useVisitPlanner(["q1", "q2"]));

    expect(result.current.hydrated).toBe(true);
    expect(result.current.selectedQuestions).toEqual(["q1", "q2"]);
    expect(result.current.step).toBe(1);
    expect(result.current.visitType).toBe("new-symptom");
    expect(result.current.customQuestions).toEqual([]);
    expect(result.current.notes).toBe("");
  });

  it("initializes from localStorage when data exists", () => {
    const savedState: PlannerState = {
      step: 2,
      visitType: "medication",
      selectedQuestions: ["q3"],
      customQuestions: [{ id: "cq-1", text: "My custom q" }],
      notes: "some notes",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(["q1", "q2"]));

    expect(result.current.hydrated).toBe(true);
    expect(result.current.step).toBe(2);
    expect(result.current.visitType).toBe("medication");
    expect(result.current.selectedQuestions).toEqual(["q3"]);
    expect(result.current.customQuestions).toEqual([{ id: "cq-1", text: "My custom q" }]);
    expect(result.current.notes).toBe("some notes");
  });

  it("ignores invalid localStorage data and uses defaults", () => {
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify({ invalid: "data" }));

    const { result } = renderHook(() => useVisitPlanner(["q1", "q2"]));

    expect(result.current.selectedQuestions).toEqual(["q1", "q2"]);
    expect(result.current.step).toBe(1);
  });

  it("changeVisitType updates visitType and resets selectedQuestions", () => {
    const { result } = renderHook(() => useVisitPlanner(["q1", "q2"]));

    act(() => {
      result.current.changeVisitType("followup", ["q3", "q4"]);
    });

    expect(result.current.visitType).toBe("followup");
    expect(result.current.selectedQuestions).toEqual(["q3", "q4"]);
  });

  it("toggleQuestion adds and removes questions", () => {
    const { result } = renderHook(() => useVisitPlanner(["q1"]));

    act(() => {
      result.current.toggleQuestion("q2");
    });
    expect(result.current.selectedQuestions).toEqual(["q1", "q2"]);

    act(() => {
      result.current.toggleQuestion("q1");
    });
    expect(result.current.selectedQuestions).toEqual(["q2"]);
  });

  it("addCustomQuestion adds a new question if not empty and not duplicate", () => {
    vi.setSystemTime(new Date("2023-01-01T00:00:00Z"));

    const { result } = renderHook(() => useVisitPlanner([]));

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

    // Test duplicate (case insensitive)
    act(() => {
      result.current.setCustomInput("new question");
    });
    act(() => {
      result.current.addCustomQuestion();
    });
    expect(result.current.customQuestions).toHaveLength(1);

    // Test empty
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
      selectedQuestions: [],
      customQuestions: [
        { id: "cq-1", text: "Q1" },
        { id: "cq-2", text: "Q2" },
      ],
      notes: "",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner([]));

    act(() => {
      result.current.removeCustomQuestion("cq-1");
    });

    expect(result.current.customQuestions).toEqual([{ id: "cq-2", text: "Q2" }]);
  });

  it("updates localStorage when state changes", () => {
    const { result } = renderHook(() => useVisitPlanner(["q1"]));

    act(() => {
      result.current.setStep(2);
      result.current.setNotes("test note");
    });

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.visitPlanner) || "{}");
    expect(stored).toMatchObject({
      step: 2,
      notes: "test note",
      selectedQuestions: ["q1"],
      visitType: "new-symptom",
      customQuestions: [],
    });
  });
  it("handles null value in localStorage parse", () => {
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, "null");

    const { result } = renderHook(() => useVisitPlanner(["q1"]));

    expect(result.current.selectedQuestions).toEqual(["q1"]);
  });

  it("handles invalid visitType in localStorage parse", () => {
    const savedState = {
      step: 1,
      visitType: "invalid-type",
      selectedQuestions: [],
      notes: "",
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(["q1"]));

    expect(result.current.selectedQuestions).toEqual(["q1"]);
    expect(result.current.visitType).toBe("new-symptom"); // fallback to default
  });

  it("handles partial/invalid fields in localStorage parse gracefully", () => {
    const savedState = {
      visitType: "new-symptom",
      // missing step, selectedQuestions, notes, customQuestions, or wrong types
      step: 99, // invalid step
      selectedQuestions: "not an array",
      notes: 12345, // not a string
      customQuestions: [null, "not an object", { id: "valid", text: "valid text" }],
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(["q1"]));

    expect(result.current.step).toBe(1); // fallback since 99 is invalid
    expect(result.current.selectedQuestions).toEqual([]); // fallback since it was not an array
    expect(result.current.notes).toBe(""); // fallback since it was not a string
    expect(result.current.customQuestions).toEqual([{ id: "valid", text: "valid text" }]);
  });

  it("handles missing customQuestions gracefully", () => {
    const savedState = {
      step: 1,
      visitType: "new-symptom",
      selectedQuestions: [],
      notes: "",
      // customQuestions is omitted entirely
    };
    window.localStorage.setItem(STORAGE_KEYS.visitPlanner, JSON.stringify(savedState));

    const { result } = renderHook(() => useVisitPlanner(["q1"]));

    expect(result.current.customQuestions).toEqual([]);
  });
});
