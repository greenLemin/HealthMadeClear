"use client";

import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import {
  BookOpen,
  CheckCircle2,
  Flame,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ListChecks,
  FileUp,
  FileDown,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/components/AppProviders";
import { useToast } from "@/components/ui/ToastProvider";
import {
  buildProgressExport,
  downloadProgressExport,
  parseProgressImport,
  applyProgressImport,
} from "@/lib/progressExport";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { formatRelativeDate } from "@/lib/i18n";
import type { LearningPath } from "@/types/learningPath";

type Summary = {
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalQuizzesPassed: number;
  totalQuizzesAttempted: number;
  averageQuizScore: number;
  totalTimeSpentMinutes: number;
  currentStreak: number;
  longestStreak: number;
};

type LearningPathEntry = {
  path: LearningPath;
  completedLessonIds: string[];
  nextLesson: { id: string; title: string; duration: string } | null;
  progressPercentage: number;
  isComplete: boolean;
};

type ActivityItem = {
  type: "lesson" | "quiz";
  lessonId?: string;
  quizId?: string;
  title: string;
  completedAt: string;
  score?: number;
  passed?: boolean;
};

type AchievementItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
};

type RecommendedLesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  pathTitle?: string;
};

type DashboardClientProps = {
  summary: Summary;
  learningPaths: LearningPathEntry[];
  recentActivity: ActivityItem[];
  achievements: AchievementItem[];
  recommendedNext: RecommendedLesson | null;
  displayName: string;
  locale: string;
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function getGreeting(t: (key: string) => string): string {
  const hour = new Date().getHours();
  if (hour < 12) return t("greetingMorning");
  if (hour < 17) return t("greetingAfternoon");
  return t("greetingEvening");
}

export default function DashboardClient({
  summary,
  learningPaths,
  recentActivity,
  achievements,
  recommendedNext,
  displayName,
  locale,
}: DashboardClientProps) {
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
  const passRate =
    summary.totalQuizzesAttempted > 0
      ? Math.round((summary.totalQuizzesPassed / summary.totalQuizzesAttempted) * 100)
      : 0;
  const earnedAchievements = achievements.filter((a) => a.earned);
  const activePaths = learningPaths.filter((lp) => !lp.isComplete && lp.completedLessonIds.length > 0);
  const inProgressPaths = learningPaths.filter((lp) => lp.completedLessonIds.length > 0);

  return (
    <div className="space-y-10">
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

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card padding="sm" variant="glass">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-primary-fixed p-2.5 text-primary shadow-elevation-1"
              aria-hidden="true"
            >
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-headline-md text-primary">
                {summary.totalLessonsCompleted} / {summary.totalLessonsAvailable}
              </p>
              <p className="text-label-sm text-on-surface-variant">{t("completedLessons")}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm" variant="glass">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-secondary-container/60 p-2.5 text-secondary shadow-elevation-1"
              aria-hidden="true"
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-headline-md text-primary">{summary.totalQuizzesPassed}</p>
              <p className="text-label-sm text-on-surface-variant">
                {summary.totalQuizzesAttempted > 0
                  ? t("statsPassRate", { rate: passRate })
                  : t("statsNoQuizzes")}
              </p>
            </div>
          </div>
        </Card>
        <Card padding="sm" variant="glass">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-tertiary-container/30 p-2.5 text-tertiary shadow-elevation-1"
              aria-hidden="true"
            >
              <Flame size={20} />
            </div>
            <div>
              <p className="text-headline-md text-primary">
                {t("statsStreakValue", { count: summary.currentStreak })}
              </p>
              <p className="text-label-sm text-on-surface-variant">{t("statsStreak")}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm" variant="glass">
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-surface-container p-2.5 text-primary shadow-elevation-1"
              aria-hidden="true"
            >
              <Clock size={20} />
            </div>
            <div>
              <p className="text-headline-md text-primary">{formatTime(summary.totalTimeSpentMinutes)}</p>
              <p className="text-label-sm text-on-surface-variant">{t("statsTimeSpent")}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Continue Learning */}
      <section>
        <h2 className="mb-4 font-display text-headline-md text-primary">{t("continueLearning")}</h2>
        {isFirstVisit && recommendedNext ? (
          <Card padding="md" variant="accent" className="border-secondary/30 bg-secondary-container/20">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-1 text-label-sm font-semibold text-secondary">{t("recommendedForYou")}</p>
                <h3 className="font-display text-headline-md text-primary">{recommendedNext.title}</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">{recommendedNext.description}</p>
                <div className="mt-2 flex items-center gap-3 text-label-sm text-on-surface-variant">
                  <span>{recommendedNext.duration}</span>
                  {recommendedNext.pathTitle ? (
                    <span>{t("partOfPath", { path: recommendedNext.pathTitle })}</span>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0">
                <Link href={`/learn/${recommendedNext.id}`}>
                  <Button size="lg" icon={<Sparkles size={20} />}>
                    {t("beginYourJourney")}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : activePaths.length > 0 ? (
          (() => {
            const active = activePaths[0];
            return (
              <Card padding="md" className="border-primary/20">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-label-sm font-semibold text-primary">{active.path.title}</p>
                    <h3 className="font-display text-headline-md text-primary">
                      {active.nextLesson?.title ?? t("allLessonsComplete")}
                    </h3>
                    <div className="mt-3 max-w-md">
                      <ProgressBar
                        value={active.progressPercentage}
                        label={t("lessonXofY", {
                          current: active.completedLessonIds.length + 1,
                          total: active.path.lessons.length,
                        })}
                        showPercentage
                        size="sm"
                      />
                    </div>
                  </div>
                  {active.nextLesson ? (
                    <div className="shrink-0">
                      <Link href={`/learn/${active.nextLesson.id}`}>
                        <Button size="lg" icon={<ArrowRight size={20} />}>
                          {t("continueCta")}
                        </Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })()
        ) : (
          <Card padding="md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-display text-headline-md text-primary">{t("allCaughtUpTitle")}</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">{t("allCaughtUpDesc")}</p>
              </div>
              <Link href="/learning-paths">
                <Button variant="secondary" icon={<BookOpen size={20} />}>
                  {t("browsePaths")}
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </section>

      {/* My Learning Paths */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-headline-md text-primary">{t("myLearningPaths")}</h2>
          <Link
            href="/learning-paths"
            className="text-label-md font-semibold text-primary underline underline-offset-2"
          >
            {t("browseAllPaths")} &rarr;
          </Link>
        </div>
        {inProgressPaths.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressPaths.slice(0, 4).map((entry) => (
              <div key={entry.path.id} className="surface-card px-6 py-6 md:px-8 md:py-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  {entry.path.icon ? (
                    <span className="text-headline-lg" aria-hidden="true">
                      {entry.path.icon}
                    </span>
                  ) : null}
                  <span className="chip min-h-9 px-3 py-1 text-label-sm">{entry.path.level}</span>
                  <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant">
                    <Clock size={14} aria-hidden="true" />
                    {entry.path.duration}
                  </span>
                </div>
                <h3 className="mb-2 font-display text-headline-lg text-primary">{entry.path.title}</h3>
                <p className="mb-4 text-body-md text-on-surface-variant">{entry.path.description}</p>
                <div className="mb-4 flex items-center gap-2 text-label-md text-on-surface-variant">
                  <ListChecks size={16} aria-hidden="true" />
                  <span>{t("modulesCount", { count: entry.path.lessons.length })}</span>
                </div>
                <div className="mb-5">
                  <ProgressBar
                    value={entry.progressPercentage}
                    label={t("completeLabel", {
                      completed: entry.completedLessonIds.length,
                      total: entry.path.lessons.length,
                    })}
                    showPercentage
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  {entry.isComplete ? (
                    <span className="inline-flex items-center gap-1.5 text-label-md font-semibold text-secondary">
                      {t("completedLabel")} ✓
                    </span>
                  ) : entry.nextLesson ? (
                    <Link
                      href={`/learn/${entry.nextLesson.id}`}
                      className="btn-primary inline-flex items-center gap-2 text-label-lg"
                    >
                      {t("continueCta")}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="learning"
            title={t("noPathsStarted")}
            description={t("noPathsStartedDesc")}
            action={{
              label: t("explorePathsCta"),
              onClick: () => {},
              href: "/learning-paths",
            }}
          />
        )}
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 font-display text-headline-md text-primary">{t("recentActivity")}</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div
                key={`${item.type}-${item.lessonId ?? item.quizId}-${i}`}
                className="surface-card flex items-start gap-3 px-4 py-4"
              >
                <div
                  className={`mt-0.5 rounded-full p-1.5 shadow-elevation-1 ${
                    item.type === "lesson"
                      ? "bg-primary-fixed text-primary"
                      : "bg-secondary-container/60 text-secondary"
                  }`}
                  aria-hidden="true"
                >
                  {item.type === "lesson" ? <BookOpen size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label-md text-on-surface">{item.title}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {item.type === "quiz" && item.score !== undefined
                      ? item.passed
                        ? t("quizResultPassed", { score: item.score })
                        : t("quizResultFailed", { score: item.score })
                      : null}
                    <span className="ml-2">
                      {formatRelativeDate(item.completedAt, locale as "en" | "es")}
                    </span>
                  </p>
                </div>
                {item.lessonId ? (
                  <Link
                    href={`/learn/${item.lessonId}`}
                    className="shrink-0 text-label-sm font-semibold text-primary underline underline-offset-2"
                    aria-label={`${t("viewDetails")}: ${item.title}`}
                  >
                    {t("viewDetails")}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            variant="activity"
            title={t("noActivity")}
            description={t("noActivityDesc")}
            action={{
              label: t("startFirstLessonCta"),
              onClick: () => {},
              href: recommendedNext ? `/learn/${recommendedNext.id}` : "/learn",
            }}
          />
        )}
      </section>

      {/* Recently Earned Achievements */}
      {earnedAchievements.length > 0 ? (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="font-display text-headline-md text-primary">{t("recentlyEarned")}</h2>
            <Link
              href="/dashboard/achievements"
              className="text-label-md font-semibold text-primary underline underline-offset-2"
            >
              {t("viewAllAchievements")} &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {earnedAchievements.slice(0, 4).map((achievement) => (
              <Card key={achievement.id} padding="sm" className="border-secondary/30 text-center">
                <span className="text-headline-lg" aria-hidden="true">
                  {achievement.icon}
                </span>
                <p className="mt-2 text-label-sm font-semibold text-on-surface">{achievement.title}</p>
                {achievement.earnedAt ? (
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {formatRelativeDate(achievement.earnedAt, locale as "en" | "es")}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
