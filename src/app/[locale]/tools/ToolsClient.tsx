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
      featured: true,
    },
    {
      title: t("careTitle"),
      description: t("careDescription"),
      href: "/tools/care-guide",
      icon: MapPinned,
      featured: false,
    },
    {
      title: t("labelsTitle"),
      description: t("labelsDescription"),
      href: "/learn/understanding-prescription-labels",
      icon: BookOpen,
      featured: false,
    },
    {
      title: t("checklistTitle"),
      description: t("checklistDescription"),
      href: "/tools/visit-checklist",
      icon: ClipboardList,
      featured: true,
    },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader badge={t("pageBadge")} title={t("pageTitle")} description={t("pageDescription")} />

        <div className="mb-10">
          <MedicalDisclaimer />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={
                  tool.featured
                    ? "hover-lift rounded-[24px] border border-outline-variant bg-gradient-to-br from-secondary-container to-primary-fixed p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_42px_rgba(15,23,42,0.08)]"
                    : "group hover-lift rounded-[24px] border border-outline-variant bg-surface p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]"
                }
              >
                <div className="mb-6 inline-flex rounded-2xl bg-surface px-4 py-4 text-primary shadow-sm">
                  <Icon size={28} />
                </div>
                <h2 className="mb-3 text-headline-lg text-primary">{tool.title}</h2>
                <p className="mb-6 text-body-md text-on-surface-variant">{tool.description}</p>
                <span className="inline-flex min-h-[48px] items-center rounded-full border border-primary px-5 text-sm font-semibold text-primary">
                  {tCommon("useTool")}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
