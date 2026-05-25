"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, MapPinned, MessagesSquare } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";

export default function ToolsPage() {
  const { locale } = useAppState();

  const tools = [
    {
      title: locale === "es" ? "¿Qué debo preguntar?" : "What should I ask?",
      description: locale === "es" ? "Crea una lista personalizada de preguntas para llevar a tu próxima cita médica." : "Generate a personalized list of questions to bring to your next doctor's appointment.",
      href: "/tools/visit-planner",
      icon: MessagesSquare,
      featured: true,
    },
    {
      title: locale === "es" ? "¿Dónde debo ir?" : "Where should I go?",
      description: locale === "es" ? "Compara cuidado en casa, atención primaria, urgencias y sala de emergencia en lenguaje claro." : "Compare home care, primary care, urgent care, and emergency care in clear language.",
      href: "/tools/care-guide",
      icon: MapPinned,
      featured: false,
    },
    {
      title: locale === "es" ? "Entender etiquetas de medicina" : "Understanding medicine labels",
      description: locale === "es" ? "Abre nuestra lección sobre recetas, dosis, advertencias y resurtidos." : "Open our lesson on reading prescriptions, dosage, warnings, and refill details.",
      href: "/learn/understanding-prescription-labels",
      icon: BookOpen,
      featured: false,
    },
    {
      title: locale === "es" ? "Lista para preparar tu visita" : "Visit prep checklist",
      description: locale === "es" ? "Usa una lista imprimible para tener tu identificación, seguro, documentos y notas listas." : "Use a printable checklist so you have your ID, insurance, records, and notes ready.",
      href: "/tools/visit-checklist",
      icon: ClipboardList,
      featured: true,
    },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          badge={locale === "es" ? "Recursos" : "Resources"}
          title={locale === "es" ? "Tus herramientas de salud" : "Your Health Toolkit"}
          description={
            locale === "es"
              ? "Navegar el sistema de salud no tiene que ser confuso. Usa estas herramientas para prepararte, entender opciones de atención y hacer mejores preguntas."
              : "Navigating healthcare does not have to be confusing. Use these practical tools to prepare for visits, understand care options, and ask better questions."
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={tool.featured ? "rounded-[24px] border border-outline-variant bg-gradient-to-br from-secondary-container to-primary-fixed p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.08)]" : "group rounded-[24px] border border-outline-variant bg-surface p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]"}
              >
                <div className="mb-6 inline-flex rounded-2xl bg-surface px-4 py-4 text-primary shadow-sm">
                  <Icon size={28} />
                </div>
                <h2 className="mb-3 text-headline-lg text-primary">{tool.title}</h2>
                <p className="mb-6 text-body-md text-on-surface-variant">{tool.description}</p>
                <span className="inline-flex min-h-[48px] items-center rounded-full border border-primary px-5 text-sm font-semibold text-primary">
                  {locale === "es" ? "Usar herramienta" : "Use tool"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
