"use client";

import { useTranslations } from "next-intl";
import ProgressBar from "@/components/ui/ProgressBar";
import Reveal from "@/components/ui/Reveal";
import { clampPercent } from "./clamp";

type CategoryProgress = {
  categoryId: string;
  label: string;
  total: number;
  completed: number;
  quizStats: { attempts: number; passed: number };
};

interface CategoryProgressListProps {
  categoryProgress: CategoryProgress[];
}

export default function CategoryProgressList({ categoryProgress }: CategoryProgressListProps) {
  const t = useTranslations("progress");

  return (
    <Reveal>
      <div className="surface-card px-6 py-6 md:px-8 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow mb-3">{t("progressByCategory")}</div>
            <h2 className="font-display text-headline-lg text-primary">{t("progressByCategory")}</h2>
          </div>
          <span className="metric-pill">{t("categoriesCount", { count: categoryProgress.length })}</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {categoryProgress.map((cat) => {
            const pct = cat.total > 0 ? clampPercent((cat.completed / cat.total) * 100) : 0;
            return (
              <article key={cat.categoryId} className="surface-card-muted px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-headline-md text-primary">
                    {cat.label || cat.categoryId}
                  </h3>
                  <span className="chip-active">{pct}%</span>
                </div>
                <ProgressBar value={pct} label={`${cat.completed}/${cat.total}`} className="mt-4" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="metric-pill">
                    {t("lessonsColumn")}: {cat.completed}/{cat.total}
                  </span>
                  <span className="metric-pill bg-secondary-container/60 text-secondary">
                    {t("quizzesPassedColumn")}: {cat.quizStats.passed}/{cat.quizStats.attempts}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}
