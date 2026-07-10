"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import Button from "@/components/ui/Button";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import { STORAGE_KEYS, readStoredStringArray, writeStoredJson } from "@/lib/preferences";
import { useTranslations } from "next-intl";

function useChecklistState() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredStringArray(STORAGE_KEYS.checklist);
    if (stored.length > 0) {
      setCheckedItems(stored);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredJson(STORAGE_KEYS.checklist, checkedItems);
  }, [checkedItems, hydrated]);

  const toggleItem = (item: string) => {
    setCheckedItems((current) => {
      const index = current.indexOf(item);
      if (index > -1) {
        const next = [...current];
        next.splice(index, 1);
        return next;
      }
      return [...current, item];
    });
  };

  return { checkedItems, toggleItem };
}

function ChecklistHeader({
  progress,
  readyText,
  itemsCompletedText,
  printText,
}: {
  progress: number;
  readyText: string;
  itemsCompletedText: string;
  printText: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="eyebrow mb-2">{readyText}</div>
        <div className="text-body-md text-on-surface-variant">{itemsCompletedText}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="chip-active">{progress}%</span>
        <Button
          type="button"
          variant="secondary"
          className="no-print"
          icon={<Printer size={18} />}
          onClick={() => window.print()}
        >
          {printText}
        </Button>
      </div>
    </div>
  );
}

function ChecklistItems({
  checklistItems,
  checkedItems,
  toggleItem,
  pageTitle,
}: {
  checklistItems: string[];
  checkedItems: string[];
  toggleItem: (item: string) => void;
  pageTitle: string;
}) {
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">{pageTitle}</legend>
      <div className="space-y-3">
        {checklistItems.map((item) => {
          const checked = checkedItems.includes(item);
          const inputId = `checklist-${item.replace(/\s+/g, "-")}`;
          return (
            <label
              key={item}
              htmlFor={inputId}
              className={
                checked
                  ? "flex w-full cursor-pointer items-center gap-4 rounded-[1.2rem] border-2 border-primary bg-primary-fixed px-5 py-4 text-left shadow-elevation-1"
                  : "flex w-full cursor-pointer items-center gap-4 rounded-[1.2rem] border border-outline-variant bg-surface px-5 py-4 text-left transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:bg-surface-container"
              }
            >
              <input
                id={inputId}
                type="checkbox"
                className="h-5 w-5 rounded border-outline text-primary focus:ring-primary"
                checked={checked}
                onChange={() => toggleItem(item)}
              />
              <span className="text-body-md text-on-surface">{item}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function VisitChecklistClient() {
  const t = useTranslations("tools");
  const tCommon = useTranslations("common");
  const checklistItems = useMemo(() => t.raw("checklistItems") as string[], [t]);

  const { checkedItems, toggleItem } = useChecklistState();

  const progress =
    checklistItems.length === 0 ? 0 : Math.round((checkedItems.length / checklistItems.length) * 100);

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          title={t("checklistPageTitle")}
          description={t("checklistPageDescription")}
          className="mb-8"
        />

        <Reveal>
          <div className="surface-card-strong max-w-4xl px-5 py-5 md:px-6">
            <ChecklistHeader
              progress={progress}
              readyText={t("readyBeforeGo")}
              itemsCompletedText={tCommon("itemsCompletedCount", {
                completed: checkedItems.length,
                total: checklistItems.length,
              })}
              printText={t("printChecklist")}
            />

            <div className="mb-8 rounded-[1.2rem] bg-surface px-4 py-4">
              <ProgressBar
                value={progress}
                label={`${checkedItems.length} ${tCommon("of")} ${checklistItems.length}`}
                showPercentage
                size="md"
              />
            </div>

            <ChecklistItems
              checklistItems={checklistItems}
              checkedItems={checkedItems}
              toggleItem={toggleItem}
              pageTitle={t("checklistPageTitle")}
            />
          </div>
        </Reveal>

        <div className="mt-8 max-w-4xl">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
