import { useRef } from "react";
import { Flame, FileUp, FileDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import {
  buildProgressExport,
  downloadProgressExport,
  parseProgressImport,
  applyProgressImport,
} from "@/lib/progressExport";
import Button from "@/components/ui/Button";
import type { Summary } from "../types";

type DashboardHeaderProps = {
  summary: Summary;
  displayName: string;
};

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("greetingMorning");
  if (hour < 17) return t("greetingAfternoon");
  return t("greetingEvening");
}

export default function DashboardHeader({ summary, displayName }: DashboardHeaderProps) {
  const t = useTranslations("dashboard");
  const { showToast } = useToast();
  const { completedLessons, recentLessons, startedPaths, quizScores, importProgress } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = buildProgressExport(Array.from(completedLessons), recentLessons, startedPaths, quizScores);
      downloadProgressExport(data);
      showToast("success", t("exportSuccess"));
    } catch (err) {
      showToast("error", t("exportError"));
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") return;

      const parsed = parseProgressImport(result);
      if (!parsed) {
        showToast("error", t("importError"));
        return;
      }

      importProgress(parsed);
      applyProgressImport(parsed);
      showToast("success", t("importSuccess"));
      setTimeout(() => window.location.reload(), 1000);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isFirstVisit = summary.totalLessonsCompleted === 0;

  return (
    <section className="section-frame flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <div className="eyebrow mb-4">{getGreeting(t)}</div>
        <h1 className="font-display text-headline-lg text-primary">
          {isFirstVisit ? t("welcomeFirstVisit") : t("welcomeBack", { name: displayName })}
        </h1>
        {summary.currentStreak > 1 ? (
          <div className="metric-pill mt-4 bg-secondary-container/60 text-secondary">
            <Flame size={18} aria-hidden="true" />
            {t("streakCallout", { count: summary.currentStreak })}
          </div>
        ) : null}
        {isFirstVisit ? (
          <p className="mt-3 text-body-md text-on-surface-variant">{t("startJourney")}</p>
        ) : null}
      </div>
      <div className="no-print flex flex-wrap gap-3">
        <Button variant="secondary" size="sm" onClick={handleExport} icon={<FileDown size={18} />}>
          {t("exportProgress")}
        </Button>
        <Button variant="secondary" size="sm" onClick={triggerFileInput} icon={<FileUp size={18} />}>
          {t("importProgress")}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          aria-label={t("importProgress")}
        />
      </div>
    </section>
  );
}
