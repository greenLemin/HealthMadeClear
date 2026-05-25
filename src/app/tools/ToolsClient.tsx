"use client";

import Link from "next/link";
import { BookOpen, ClipboardList, MapPinned, MessagesSquare } from "lucide-react";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getMessages } from "@/lib/i18n";

export default function ToolsClient() {
  const { locale } = useAppState();
  const copy = getMessages(locale);

  const tools = [
    { title: copy.tools.askTitle, description: copy.tools.askDescription, href: "/tools/visit-planner", icon: MessagesSquare, featured: true },
    { title: copy.tools.careTitle, description: copy.tools.careDescription, href: "/tools/care-guide", icon: MapPinned, featured: false },
    { title: copy.tools.labelsTitle, description: copy.tools.labelsDescription, href: "/learn/understanding-prescription-labels", icon: BookOpen, featured: false },
    { title: copy.tools.checklistTitle, description: copy.tools.checklistDescription, href: "/tools/visit-checklist", icon: ClipboardList, featured: true },
  ];

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader badge={copy.tools.pageBadge} title={copy.tools.pageTitle} description={copy.tools.pageDescription} />

        <div className="mb-10">
          <MedicalDisclaimer locale={locale} />
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
                  {copy.common.useTool}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
