"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";

export default function VisitChecklistPage() {
  const { locale } = useAppState();
  const checklistItems = locale === "es"
    ? [
        "Identificación con foto",
        "Tarjeta de seguro",
        "Lista de medicinas actuales",
        "Lista de alergias",
        "Síntomas y cuándo empezaron",
        "Preguntas que quieres hacer",
        "Resultados recientes o papeles de alta",
        "Cuaderno o teléfono para notas",
        "Agua y artículos de comodidad",
      ]
    : [
        "Photo ID",
        "Insurance card",
        "List of current medicines",
        "List of allergies",
        "Symptoms and when they started",
        "Questions you want to ask",
        "Recent test results or discharge papers",
        "A notebook or phone for notes",
        "Water and any comfort items you need",
      ];
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleItem = (item: string) => {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
    );
  };

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          title={locale === "es" ? "Lista para preparar tu visita" : "Visit prep checklist"}
          description={
            locale === "es"
              ? "Usa esta lista imprimible para asegurarte de llevar la información y los artículos que necesitas antes de salir a tu cita."
              : "Use this printable checklist to make sure you have the information and items you need before leaving for your appointment."
          }
        />

        <div className="card max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="text-label-lg text-primary">{locale === "es" ? "Listo antes de salir" : "Ready before you go"}</div>
              <div className="text-body-md text-on-surface-variant">
                {checkedItems.length} {locale === "es" ? "de" : "of"} {checklistItems.length} {locale === "es" ? "completados" : "completed"}
              </div>
            </div>
            <button type="button" className="btn-secondary no-print inline-flex items-center gap-2" onClick={() => window.print()}>
              <Printer size={18} />
              {locale === "es" ? "Imprimir lista" : "Print checklist"}
            </button>
          </div>

          <div className="progress-bar mb-8 h-3" role="progressbar" aria-valuenow={checkedItems.length} aria-valuemin={0} aria-valuemax={checklistItems.length} aria-label={locale === "es" ? "Progreso de la lista" : "Checklist progress"}>
            <div className="progress-fill" style={{ width: `${Math.round((checkedItems.length / checklistItems.length) * 100)}%` }} />
          </div>

          <div className="space-y-3">
            {checklistItems.map((item) => {
              const checked = checkedItems.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  className={checked ? "flex w-full items-center gap-4 rounded-lg border-2 border-primary bg-primary-fixed px-5 py-4 text-left" : "flex w-full items-center gap-4 rounded-lg border border-outline-variant bg-surface px-5 py-4 text-left"}
                  onClick={() => toggleItem(item)}
                >
                  <div className={checked ? "flex h-6 w-6 items-center justify-center rounded border-2 border-primary bg-primary text-on-primary" : "flex h-6 w-6 items-center justify-center rounded border-2 border-outline bg-surface"}>
                    {checked ? "✓" : ""}
                  </div>
                  <span className="text-body-md text-on-surface">{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
