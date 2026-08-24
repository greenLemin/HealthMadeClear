"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/ui/Reveal";

export type SidebarContent = {
  body: string;
  tips: string[];
  footer: string;
};

export default function LessonSidebar({ sidebar, title }: { sidebar: SidebarContent; title?: string }) {
  const t = useTranslations("learn");

  return (
    <Reveal delay={0.08}>
      <aside className="space-y-6">
        <div className="surface-card-glass sticky top-24 px-5 py-5 md:px-6">
          <h3 className="font-display text-headline-md text-primary">{title || t("stillConfused")}</h3>
          <p className="mt-3 text-body-md text-on-surface-variant">{sidebar.body}</p>
          <ul className="mt-5 space-y-3 text-body-md text-on-surface-variant">
            {sidebar.tips.map((tip, index) => (
              <li key={`${tip.slice(0, 20)}-${index}`} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-label-md font-semibold text-primary">
                  {index + 1}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-label-md font-semibold text-primary">{sidebar.footer}</p>
        </div>
      </aside>
    </Reveal>
  );
}
