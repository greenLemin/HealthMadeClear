import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/components/AppProviders";
import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "@/lib/preferences";
import {
  VISIT_TYPE_KEYS,
  type VisitTypeKey,
  type StepValue,
  type CustomQuestion,
  type PlannerQuestion,
  type PlannerState,
} from "@/types/visitPlanner";

const PLANNER_ID_RE = /^(new-symptom|medication|followup):\d+$/;

export const PLANNER_DEFAULTS_BY_TYPE: Record<VisitTypeKey, string[]> = {
  "new-symptom": ["new-symptom:2", "new-symptom:3"],
  medication: ["medication:1", "medication:3"],
  followup: ["followup:0", "followup:3"],
};

function parsePlannerState(value: unknown): PlannerState | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Partial<PlannerState>;
  if (!VISIT_TYPE_KEYS.includes(parsed.visitType as VisitTypeKey)) return null;

  const rawCustom = parsed.customQuestions;
  const parsedCustomQuestions: CustomQuestion[] = Array.isArray(rawCustom)
    ? rawCustom.filter(
        (q): q is CustomQuestion =>
          !!q &&
          typeof (q as CustomQuestion).id === "string" &&
          typeof (q as CustomQuestion).text === "string"
      )
    : [];

  return {
    visitType: parsed.visitType as VisitTypeKey,
    selectedQuestions: Array.isArray(parsed.selectedQuestions)
      ? parsed.selectedQuestions.filter((q): q is string => typeof q === "string")
      : [],
    customQuestions: parsedCustomQuestions,
    notes: typeof parsed.notes === "string" ? parsed.notes.slice(0, 2000) : "",
    step:
      typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 3
        ? (parsed.step as StepValue)
        : 1,
  };
}

function migrateSelectedQuestions(selected: string[], catalog: readonly PlannerQuestion[]): string[] {
  const textToId = new Map<string, string>();
  for (const item of catalog) {
    if (!textToId.has(item.text)) textToId.set(item.text, item.id);
  }

  const migrated: string[] = [];
  for (const value of selected) {
    if (PLANNER_ID_RE.test(value)) {
      migrated.push(value);
      continue;
    }
    const mapped = textToId.get(value);
    if (mapped) migrated.push(mapped);
  }
  return migrated;
}

function readPlannerState(): PlannerState | null {
  return (
    readStoredJson(STORAGE_KEYS.visitPlannerV2, parsePlannerState) ??
    readStoredJson(STORAGE_KEYS.visitPlanner, parsePlannerState)
  );
}

function useCustomQuestions() {
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customInput, setCustomInput] = useState("");

  const addCustomQuestion = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (customQuestions.some((q) => q.text.toLowerCase() === trimmed.toLowerCase())) return;

    setCustomQuestions((current) => [...current, { id: `cq-${Date.now()}`, text: trimmed }]);
    setCustomInput("");
  };

  const removeCustomQuestion = (idToRemove: string) => {
    setCustomQuestions((current) => current.filter((q) => q.id !== idToRemove));
  };

  return {
    customQuestions,
    setCustomQuestions,
    customInput,
    setCustomInput,
    addCustomQuestion,
    removeCustomQuestion,
  };
}

function useSelectedQuestions() {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const toggleQuestion = (question: string) => {
    setSelectedQuestions((current) => {
      const index = current.indexOf(question);
      if (index === -1) return [...current, question];
      const next = [...current];
      next.splice(index, 1);
      return next;
    });
  };

  return {
    selectedQuestions,
    setSelectedQuestions,
    toggleQuestion,
  };
}

export function useVisitPlanner(questionCatalog: PlannerQuestion[] = []) {
  const { wipeGeneration } = useAppState();
  const [step, setStepState] = useState<StepValue>(1);
  const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");
  const { selectedQuestions, setSelectedQuestions, toggleQuestion } = useSelectedQuestions();
  const {
    customQuestions,
    setCustomQuestions,
    customInput,
    setCustomInput,
    addCustomQuestion,
    removeCustomQuestion,
  } = useCustomQuestions();
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const catalogRef = useRef(questionCatalog);
  const wipeGenAtHydrateRef = useRef(0);

  useEffect(() => {
    catalogRef.current = questionCatalog;
  }, [questionCatalog]);

  useEffect(() => {
    const saved = readPlannerState();

    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore planner state from storage on mount
      setStepState(saved.step);
      setVisitType(saved.visitType);
      setSelectedQuestions(migrateSelectedQuestions(saved.selectedQuestions, catalogRef.current));
      setCustomQuestions(saved.customQuestions ?? []);
      setNotes(saved.notes);
    } else {
      setSelectedQuestions([...PLANNER_DEFAULTS_BY_TYPE["new-symptom"]]);
    }

    wipeGenAtHydrateRef.current = wipeGeneration;
    setHydrated(true);
    // Hydrate once. Catalog is read via ref for v1 text→id mapping; visitType must not retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (wipeGeneration > wipeGenAtHydrateRef.current) {
      wipeGenAtHydrateRef.current = wipeGeneration;
      setStepState(1);
      setVisitType("new-symptom");
      setSelectedQuestions([...PLANNER_DEFAULTS_BY_TYPE["new-symptom"]]);
      setCustomQuestions([]);
      setCustomInput("");
      setNotes("");
      return;
    }

    const state: PlannerState = {
      visitType,
      selectedQuestions,
      customQuestions,
      notes: notes.slice(0, 2000),
      step,
    };

    writeStoredJson(STORAGE_KEYS.visitPlannerV2, state);
  }, [
    customQuestions,
    hydrated,
    notes,
    selectedQuestions,
    setCustomInput,
    setCustomQuestions,
    setSelectedQuestions,
    step,
    visitType,
    wipeGeneration,
  ]);

  const setStep = (next: StepValue) => {
    if (!hydrated) return;
    setStepState(next);
  };

  const changeVisitType = (nextType: VisitTypeKey) => {
    if (!hydrated) return;
    setVisitType(nextType);
    setSelectedQuestions([...PLANNER_DEFAULTS_BY_TYPE[nextType]]);
  };

  return {
    step,
    setStep,
    visitType,
    setVisitType,
    changeVisitType,
    selectedQuestions,
    setSelectedQuestions,
    toggleQuestion,
    customQuestions,
    setCustomQuestions,
    customInput,
    setCustomInput,
    addCustomQuestion,
    removeCustomQuestion,
    notes,
    setNotes,
    hydrated,
  };
}
