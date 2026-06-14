"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import { STORAGE_KEYS, readStoredStringArray, writeStoredJson } from "@/lib/preferences";
import { useTranslations } from "next-intl";

export default function VisitChecklistClient() {
  const t = useTranslations("tools");
  const tCommon = useTranslations("common");
  const checklistItems = useMemo(() => t.raw("checklistItems") as string[], [t]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredStringArray(STORAGE_KEYS.checklist);
    if (stored.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckedItems(stored);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredJson(STORAGE_KEYS.checklist, checkedItems);
  }, [checkedItems, hydrated]);

  const toggleItem = (item: string) => {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={t("checklistPageTitle")} description={t("checklistPageDescription")} />

        <div className="card max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-label-lg text-primary">{t("readyBeforeGo")}</div>
              <div className="text-body-md text-on-surface-variant">
                {checkedItems.length} {tCommon("of")} {checklistItems.length}{" "}
                {tCommon("completed").toLowerCase()}
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary no-print inline-flex items-center gap-2"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              {t("printChecklist")}
            </button>
          </div>

          <div
            className="progress-bar mb-8 h-3"
            role="progressbar"
            aria-valuenow={checkedItems.length}
            aria-valuemin={0}
            aria-valuemax={checklistItems.length}
            aria-label={t("checklistProgress")}
          >
            <div
              className="progress-fill"
              style={{
                width: `${checklistItems.length === 0 ? 0 : Math.round((checkedItems.length / checklistItems.length) * 100)}%`,
              }}
            />
          </div>

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
                      ? "flex w-full cursor-pointer items-center gap-4 rounded-lg border-2 border-primary bg-primary-fixed px-5 py-4 text-left"
                      : "flex w-full cursor-pointer items-center gap-4 rounded-lg border border-outline-variant bg-surface px-5 py-4 text-left"
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
        </div>

        <div className="mt-8 max-w-4xl">
          <MedicalDisclaimer />
        </div>
      </div>
    </div>
  );
}
