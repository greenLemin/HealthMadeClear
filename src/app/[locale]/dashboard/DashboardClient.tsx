"use client";

import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { BookOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { getCategoryLabel } from "@/lib/i18n";
import { getCompletedPathCount, getPathProgress, getStartedPathCount } from "@/lib/content";
import { getLearningPaths, getLessons } from "@/lib/localizedContent";
import {
  applyProgressImport,
  buildProgressExport,
  downloadProgressExport,
  parseProgressImport,
} from "@/lib/progressExport";

export default function DashboardClient() {
  const { completedLessons, locale, recentLessons, startedPaths } = useAppState();
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const tPaths = useTranslations("paths");
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<"success" | "error" | null>(null);
  const lessons = getLessons(locale);
  const learningPaths = getLearningPaths(locale);

  const totalLessons = lessons.length;
  const completedCount = completedLessons.length;
  const startedPathCount = getStartedPathCount(completedLessons, startedPaths, lessons, learningPaths);
  const completedPathCount = getCompletedPathCount(completedLessons, lessons, learningPaths);
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const recentLessonItems = recentLessons
    .map((lessonId) => lessons.find((lesson) => lesson.id === lessonId))
    .filter((lesson): lesson is (typeof lessons)[number] => Boolean(lesson))
    .slice(0, 3);

  const activePath = (() => {
    let fallback:
      | { path: (typeof learningPaths)[0]; progress: ReturnType<typeof getPathProgress> }
      | undefined;
    for (const path of learningPaths) {
      const progress = getPathProgress(path.id, completedLessons, lessons, learningPaths);
      if (progress.completedCount > 0 && progress.completedCount < progress.totalCount) {
        return { path, progress };
      }
      if (!fallback && progress.totalCount > 0) {
        fallback = { path, progress };
      }
    }
    return fallback;
  })();

  const nextLesson = activePath
    ? (lessons.find(
        (lesson) => activePath.path.lessons.includes(lesson.id) && !completedLessons.includes(lesson.id)
      ) ?? lessons.find((lesson) => activePath.path.lessons.includes(lesson.id)))
    : undefined;

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader title={t("title")} description={t("description")} />

        <div className="no-print mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() =>
              downloadProgressExport(buildProgressExport(completedLessons, recentLessons, startedPaths))
            }
          >
            {t("exportProgress")}
          </button>
          <button type="button" className="btn-secondary" onClick={() => importInputRef.current?.click()}>
            {t("importProgress")}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const data = parseProgressImport(text);
              if (!data) {
                setImportStatus("error");
                setTimeout(() => setImportStatus(null), 5000);
                return;
              }
              applyProgressImport(data);
              setImportStatus("success");
              setTimeout(() => window.location.reload(), 1000);
            }}
          />
          {importStatus && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                importStatus === "success"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-error-container text-on-error-container"
              }`}
            >
              {importStatus === "success" ? t("importSuccess") : t("importError")}
            </p>
          )}
        </div>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <div className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary-fixed p-3 text-primary">
                <BookOpen size={22} />
              </div>
              <div>
                <div className="text-label-md text-on-surface-variant">{t("completedLessons")}</div>
                <div className="text-headline-lg text-primary">
                  {completedCount} / {totalLessons}
                </div>
              </div>
            </div>
            <div
              className="progress-bar mb-3 h-3"
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t("overallProgress")}
            >
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
            <div className="text-sm text-on-surface-variant">
              {progressPercentage}% {t("ofLibrary")}
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-secondary-container p-3 text-primary">
                <TrendingUp size={22} />
              </div>
              <div>
                <div className="text-label-md text-on-surface-variant">{t("pathsInProgress")}</div>
                <div className="text-headline-lg text-primary">{startedPathCount}</div>
              </div>
            </div>
            <div className="text-body-md text-on-surface-variant">
              {startedPathCount === 0 ? t("noPathsProgress") : t("keepGoing")}
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-surface-container p-3 text-primary">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div className="text-label-md text-on-surface-variant">{t("pathsCompleted")}</div>
                <div className="text-headline-lg text-primary">{completedPathCount}</div>
              </div>
            </div>
            <div className="text-body-md text-on-surface-variant">
              {completedPathCount === 0 ? t("noPathsCompleted") : t("pathsCompletedMsg")}
            </div>
          </div>
        </div>

        <div className="mb-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-card">
            <div className="grid gap-0 md:grid-cols-[0.8fr_1.2fr]">
              <div className="min-h-72 bg-gradient-to-br from-primary-container to-primary-fixed" />
              <div className="p-6 md:p-8">
                <div className="mb-3 inline-flex rounded-full bg-surface-container px-4 py-2 text-sm font-semibold text-primary">
                  {activePath ? t("upNext") : t("readyWhenYouAre")}
                </div>
                <h2 className="mb-3 text-headline-lg text-primary">
                  {nextLesson ? nextLesson.title : t("startFirstLesson")}
                </h2>
                <p className="mb-6 text-body-md text-on-surface-variant">
                  {nextLesson ? nextLesson.description : t("browseIntroLessons")}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={nextLesson ? `/learn/${nextLesson.id}` : "/learning-paths"}
                    className="btn-primary inline-flex items-center justify-center"
                  >
                    {nextLesson ? t("resumeLesson") : t("explorePaths")}
                  </Link>
                  {nextLesson ? (
                    <span className="text-sm text-on-surface-variant">{nextLesson.duration}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="mb-5 text-headline-md text-primary">{t("overview")}</h2>
            <div className="space-y-5">
              {learningPaths.slice(0, 3).map((path) => {
                const progress = getPathProgress(path.id, completedLessons, lessons, learningPaths);
                return (
                  <div key={path.id}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-body-md text-on-surface">{path.title}</span>
                      <span className="text-sm font-semibold text-primary">{progress.percentage}%</span>
                    </div>
                    <div
                      className="progress-bar mb-2"
                      role="progressbar"
                      aria-valuenow={progress.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${path.title} ${tPaths("progressLabel")}`}
                    >
                      <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      {progress.completedCount} {tCommon("of")} {progress.totalCount} {t("modulesCompleted")}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="card">
            <h2 className="mb-6 text-headline-md text-primary">{t("recentMilestones")}</h2>
            <div className="space-y-4">
              {completedCount === 0 ? (
                <div className="text-body-md text-on-surface-variant">{t("noRecentMilestones")}</div>
              ) : (
                completedLessons.slice(0, 3).map((lessonId) => {
                  const lesson = lessons.find((item) => item.id === lessonId);
                  if (!lesson) return null;
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-start gap-3 rounded-lg bg-surface-container-low p-4"
                    >
                      <div className="mt-1 rounded-full bg-secondary-container p-1 text-primary">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <div className="text-label-md text-on-surface">
                          {tCommon("completed")}: {lesson.title}
                        </div>
                        <div className="text-sm text-on-surface-variant">
                          {getCategoryLabel(lesson.categoryId, locale)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="text-headline-md text-primary">{t("recentlyViewed")}</h2>
              <Link href="/learn" className="text-sm font-semibold text-primary">
                {t("seeAll")}
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(recentLessonItems.length > 0 ? recentLessonItems : lessons.slice(0, 3)).map((lesson) => (
                <Link key={lesson.id} href={`/learn/${lesson.id}`} className="card-hover">
                  <h3 className="mb-2 text-label-lg text-primary">{lesson.title}</h3>
                  <p className="mb-4 text-sm text-on-surface-variant">{lesson.description}</p>
                  <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                    <Clock size={14} />
                    {lesson.duration}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
