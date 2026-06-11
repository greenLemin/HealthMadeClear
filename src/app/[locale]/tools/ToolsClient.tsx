"use client";

import { Link } from "@/i18n/navigation";
import { BookOpen, ClipboardList, MapPinned, MessagesSquare } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import PageHeader from "@/components/PageHeader";
import { useTranslations } from "next-intl";

export default function ToolsClient() {
  const t = useTranslations("tools");
  const tCommon = useTranslations("common");

  const tools = [
    {
      title: t("askTitle"),
      description: t("askDescription"),
      href: "/tools/visit-planner",
      icon: MessagesSquare,
      variant: "gradient" as const,
    },
    {
      title: t("careTitle"),
      description: t("careDescription"),
      href: "/tools/care-guide",
      icon: MapPinned,
      variant: "standard" as const,
    },
    {
      title: t("labelsTitle"),
      description: t("labelsDescription"),
      href: "/learn/understanding-prescription-labels",
      icon: BookOpen,
      variant: "muted" as const,
    },
    {
      title: t("checklistTitle"),
      description: t("checklistDescription"),
      href: "/tools/visit-checklist",
      icon: ClipboardList,
      variant: "dark" as const,
    },
  ];

  const cardClass: Record<(typeof tools)[number]["variant"], string> = {
    gradient:
      "hover-lift rounded-[24px] border border-outline-variant bg-gradient-to-br from-secondary-container to-primary-fixed p-6 shadow-card hover:shadow-card-hover",
    standard:
      "group hover-lift rounded-[24px] border border-outline-variant bg-surface p-6 shadow-card hover:shadow-card-hover",
    muted:
      "group hover-lift rounded-[24px] border border-outline-variant bg-surface-container-low p-6 shadow-card hover:shadow-card-hover",
    dark: "group hover-lift rounded-[24px] border border-primary bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-card-hover hover:shadow-elevation-2",
  };

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader badge={t("pageBadge")} title={t("pageTitle")} description={t("pageDescription")} />

        <div className="mb-10">
          <MedicalDisclaimer />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isDark = tool.variant === "dark";
            return (
              <Link key={tool.href} href={tool.href} className={cardClass[tool.variant]}>
                <div
                  className={`mb-6 inline-flex rounded-2xl px-4 py-4 shadow-sm ${
                    isDark ? "bg-surface/15 text-on-primary" : "bg-surface text-primary"
                  }`}
                >
                  <Icon size={28} />
                </div>
                <h2 className={`mb-3 text-headline-lg ${isDark ? "text-on-primary" : "text-primary"}`}>
                  {tool.title}
                </h2>
                <p
                  className={`mb-6 text-body-md ${isDark ? "text-on-primary/90" : "text-on-surface-variant"}`}
                >
                  {tool.description}
                </p>
                <span
                  className={`inline-flex min-h-[48px] items-center rounded-full border px-5 text-sm font-semibold ${
                    isDark ? "border-on-primary text-on-primary" : "border-primary text-primary"
                  }`}
                >
                  {tCommon("useTool")}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
