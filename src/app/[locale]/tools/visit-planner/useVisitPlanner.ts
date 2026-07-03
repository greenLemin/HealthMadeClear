import { useEffect, useState } from "react";
import { STORAGE_KEYS, readStoredJson, writeStoredJson } from "@/lib/preferences";
import {
  VISIT_TYPE_KEYS,
  type VisitTypeKey,
  type StepValue,
  type CustomQuestion,
  type PlannerState,
} from "./types";

export function useVisitPlanner(defaultQuestions: string[]) {
  const [step, setStep] = useState<StepValue>(1);
  const [visitType, setVisitType] = useState<VisitTypeKey>("new-symptom");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customInput, setCustomInput] = useState("");
  const [notes, setNotes] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = readStoredJson(STORAGE_KEYS.visitPlanner, (value): PlannerState | null => {
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
    });

    if (saved) {
      setStep(saved.step);
      setVisitType(saved.visitType);
      setSelectedQuestions(saved.selectedQuestions);
      setCustomQuestions(saved.customQuestions ?? []);
      setNotes(saved.notes);
    } else {
      setSelectedQuestions(defaultQuestions);
    }

    setHydrated(true);
  }, [defaultQuestions]);

  useEffect(() => {
    if (!hydrated) return;

    const state: PlannerState = {
      visitType,
      selectedQuestions,
      customQuestions,
      notes: notes.slice(0, 2000),
      step,
    };

    writeStoredJson(STORAGE_KEYS.visitPlanner, state);
  }, [customQuestions, hydrated, notes, selectedQuestions, step, visitType]);

  const changeVisitType = (nextType: VisitTypeKey, newDefaultQuestions: string[]) => {
    setVisitType(nextType);
    setSelectedQuestions(newDefaultQuestions);
  };

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
