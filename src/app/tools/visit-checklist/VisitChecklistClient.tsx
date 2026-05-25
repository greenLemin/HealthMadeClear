"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";
import { STORAGE_KEYS } from "@/lib/preferences";

export default function VisitChecklistClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);
  const checklistItems = copy.tools.checklistItems;
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEYS.checklist);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) setCheckedItems(parsed);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (item: string) => {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={copy.tools.checklistPageTitle} description={copy.tools.checklistPageDescription} />

        <div className="card max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-label-lg text-primary">{copy.tools.readyBeforeGo}</div>
              <div className="text-body-md text-on-surface-variant">
                {checkedItems.length} {copy.common.of} {checklistItems.length} {copy.common.completed.toLowerCase()}
              </div>
            </div>
            <button type="button" className="btn-secondary no-print inline-flex items-center gap-2" onClick={() => window.print()}>
              <Printer size={18} />
              {copy.tools.printChecklist}
            </button>
          </div>

          <div
            className="progress-bar mb-8 h-3"
            role="progressbar"
            aria-valuenow={checkedItems.length}
            aria-valuemin={0}
            aria-valuemax={checklistItems.length}
            aria-label={copy.tools.checklistProgress}
          >
            <div
              className="progress-fill"
              style={{ width: `${Math.round((checkedItems.length / checklistItems.length) * 100)}%` }}
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
          <MedicalDisclaimer locale={locale} />
        </div>
      </div>
    </main>
  );
}
