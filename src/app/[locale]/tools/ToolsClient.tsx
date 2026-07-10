"use client";

import { Link } from "@/i18n/navigation";
import { BookOpen, ClipboardList, MapPinned, MessagesSquare } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/ui/Reveal";
import { useTranslations } from "next-intl";

type ToolVariant = "standard" | "muted" | "dark";

type Tool = {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  variant: ToolVariant;
};

const getTools = (t: (key: string) => string): Tool[] => [
  {
    title: t("askTitle"),
    description: t("askDescription"),
    href: "/tools/visit-planner",
    icon: MessagesSquare,
    variant: "standard",
  },
  {
    title: t("careTitle"),
    description: t("careDescription"),
    href: "/tools/care-guide",
    icon: MapPinned,
    variant: "standard",
  },
  {
    title: t("labelsTitle"),
    description: t("labelsDescription"),
    href: "/learn/understanding-prescription-labels",
    icon: BookOpen,
    variant: "muted",
  },
  {
    title: t("checklistTitle"),
    description: t("checklistDescription"),
    href: "/tools/visit-checklist",
    icon: ClipboardList,
    variant: "dark",
  },
];

const cardClass: Record<ToolVariant, string> = {
  standard:
    "surface-card group block p-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover",
  muted:
    "surface-card-muted group block p-6 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-card-hover",
  dark: "group block rounded-[1.75rem] border border-primary/20 bg-primary p-6 text-on-primary shadow-elevation-3 transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-floating",
};

function ToolCard({ tool, tCommon }: { tool: Tool; tCommon: (key: string) => string }) {
  const Icon = tool.icon;
  const isDark = tool.variant === "dark";

  return (
    <Link href={tool.href} className={cardClass[tool.variant]}>
      <div
        className={`mb-6 inline-flex rounded-full px-4 py-4 shadow-elevation-1 ${
          isDark ? "bg-surface/15 text-on-primary" : "bg-surface text-primary"
        }`}
        aria-hidden="true"
      >
        <Icon size={28} />
      </div>
      <h2 className={`font-display text-headline-lg ${isDark ? "text-on-primary" : "text-primary"}`}>
        {tool.title}
      </h2>
      <p className={`mb-6 mt-3 text-body-md ${isDark ? "text-on-primary/90" : "text-on-surface-variant"}`}>
        {tool.description}
      </p>
      <span
        className={`inline-flex min-h-[48px] items-center rounded-full border px-5 text-label-md font-semibold ${
          isDark
            ? "border-on-primary/40 bg-surface/10 text-on-primary"
            : "border-primary/20 bg-surface-container-low text-primary"
        }`}
      >
        {tCommon("useTool")}
      </span>
    </Link>
  );
}

export default function ToolsClient() {
  const t = useTranslations("tools");
  const tCommon = useTranslations("common");
  const tools = getTools(t);

  return (
    <div className="px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-container">
        <PageHeader
          badge={t("pageBadge")}
          title={t("pageTitle")}
          description={t("pageDescription")}
          className="mb-8"
        />

        <div className="mb-10">
          <MedicalDisclaimer />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool, index) => (
            <Reveal key={tool.href} delay={index * 0.05}>
              <ToolCard tool={tool} tCommon={tCommon} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
