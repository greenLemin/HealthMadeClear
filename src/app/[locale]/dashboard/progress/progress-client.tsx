"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Clock, BookOpen, CheckCircle2, Flame, TrendingUp, ArrowLeft, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import { formatRelativeDate } from "@/lib/i18n";

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

type QuizPerfItem = {
  category: string;
  categoryId: string;
  attemptsCount: number;
  averageScore: number;
  passRate: number;
};

type CompletedLesson = {
  lessonId: string;
  title: string;
  category: string;
  categoryId: string;
  completedAt: string;
  quizScore: number | null;
};

type CategoryProgress = {
  categoryId: string;
  label: string;
  total: number;
  completed: number;
  quizStats: { attempts: number; passed: number };
};

type PaginatedResult = {
  lessons: CompletedLesson[];
  total: number;
  page: number;
  totalPages: number;
};

type ProgressClientProps = {
  summary: Summary;
  quizPerformance: QuizPerfItem[];
  completedLessons: PaginatedResult;
  activeDays: string[];
  categoryProgress: CategoryProgress[];
  memberSince: string;
  locale: string;
};

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

function MemberSince({ date }: { date: string }) {
  if (!date) return null;
  const d = new Date(date);
  return <span>Member since {d.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>;
}

export default function ProgressClient({
  summary,
  quizPerformance,
  completedLessons,
  activeDays,
  categoryProgress,
  memberSince,
}: ProgressClientProps) {
  const [page, setPage] = useState(1);
  const overallPct =
    summary.totalLessonsAvailable > 0
      ? Math.round((summary.totalLessonsCompleted / summary.totalLessonsAvailable) * 100)
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const activeSet = new Set(activeDays);

  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const hasActivityToday = activeSet.has(today);

  return (
    <div className="space-y-10">
      {/* Section 1: Overall Progress */}
      <section>
        <h2 className="mb-6 text-headline-md text-primary">Overall Progress</h2>
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-card">
            <div className="relative mb-4 flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-surface-container"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${overallPct * 2.64} 264`}
                  strokeLinecap="round"
                  className="text-secondary"
                />
              </svg>
              <span className="absolute text-headline-lg font-bold text-primary">{overallPct}%</span>
            </div>
            <p className="text-label-md text-on-surface-variant">
              {summary.totalLessonsCompleted} of {summary.totalLessonsAvailable} lessons completed
            </p>
          </div>
          <div className="space-y-4">
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-primary" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Total time learning</p>
                  <p className="text-headline-md text-primary">{formatTime(summary.totalTimeSpentMinutes)}</p>
                </div>
              </div>
            </Card>
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-primary" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">
                    <MemberSince date={memberSince} />
                  </p>
                  <p className="text-headline-md text-primary">{summary.totalLessonsCompleted} lessons</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 2: Progress by Category */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Progress by Category</h2>
        <div className="overflow-hidden rounded-2xl border border-outline-variant">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-container text-left text-label-md font-semibold text-on-surface-variant">
                <th className="px-4 py-3 md:px-6">Category</th>
                <th className="px-4 py-3 md:px-6">Lessons Completed</th>
                <th className="hidden px-4 py-3 md:table-cell md:px-6">Quizzes Passed</th>
                <th className="hidden px-4 py-3 md:table-cell md:px-6">Avg. Quiz Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {categoryProgress.map((cat) => {
                const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
                return (
                  <tr key={cat.categoryId} className="bg-surface-container-lowest">
                    <td className="px-4 py-4 text-label-md font-medium text-on-surface md:px-6">
                      {cat.label || cat.categoryId}
                    </td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="max-w-[160px]">
                        <ProgressBar value={pct} size="sm" />
                      </div>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        {cat.completed}/{cat.total}
                      </p>
                    </td>
                    <td className="hidden px-4 py-4 text-label-md text-on-surface-variant md:table-cell md:px-6">
                      {cat.quizStats.passed}/{cat.quizStats.attempts}
                    </td>
                    <td className="hidden px-4 py-4 text-label-md text-on-surface-variant md:table-cell md:px-6">
                      {cat.quizStats.attempts > 0
                        ? `${Math.round((cat.quizStats.passed / cat.quizStats.attempts) * 100)}%`
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {/* Mobile card list fallback */}
          <div className="divide-y divide-outline-variant md:hidden">
            {categoryProgress.map((cat) => {
              const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              return (
                <div key={cat.categoryId} className="px-4 py-4">
                  <p className="mb-2 text-label-md font-medium text-on-surface">
                    {cat.label || cat.categoryId}
                  </p>
                  <ProgressBar value={pct} size="sm" />
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {cat.completed}/{cat.total} lessons | Quizzes: {cat.quizStats.passed}/
                    {cat.quizStats.attempts}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Quiz Performance */}
      {quizPerformance.length > 0 ? (
        <section>
          <h2 className="mb-4 text-headline-md text-primary">Quiz Performance</h2>
          <div className="space-y-4">
            {quizPerformance.map((item) => (
              <Card key={item.categoryId} padding="sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-label-md font-medium text-on-surface">{item.category}</p>
                    <div className="mt-2 flex items-center gap-4 text-label-sm text-on-surface-variant">
                      <span>{item.attemptsCount} attempts</span>
                      <span>Pass rate: {item.passRate}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-label-sm text-on-surface-variant">Avg:</span>
                    <div className="flex h-3 w-48 overflow-hidden rounded-full bg-surface-container md:w-64">
                      <div
                        className="h-full rounded-full bg-secondary transition-all duration-500"
                        style={{ width: `${item.averageScore}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-label-md font-semibold text-primary">
                      {item.averageScore}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {/* Section 4: Completed Lessons */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Completed Lessons</h2>
        {completedLessons.lessons.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-outline-variant md:block">
              <table className="w-full">
                <thead>
                  <tr className="bg-surface-container text-left text-label-md font-semibold text-on-surface-variant">
                    <th className="px-6 py-3">Lesson</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Completed</th>
                    <th className="px-6 py-3">Quiz Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                  {completedLessons.lessons.map((lesson) => (
                    <tr key={lesson.lessonId}>
                      <td className="px-6 py-4">
                        <Link
                          href={`/learn/${lesson.lessonId}`}
                          className="text-label-md font-medium text-primary underline-offset-2 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-label-md text-on-surface-variant">
                        {lesson.category || lesson.categoryId}
                      </td>
                      <td className="px-6 py-4 text-label-md text-on-surface-variant">
                        {formatRelativeDate(lesson.completedAt)}
                      </td>
                      <td className="px-6 py-4 text-label-md text-on-surface-variant">
                        {lesson.quizScore !== null ? `${lesson.quizScore}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile card list */}
            <div className="space-y-3 md:hidden">
              {completedLessons.lessons.map((lesson) => (
                <Card key={lesson.lessonId} padding="sm">
                  <Link
                    href={`/learn/${lesson.lessonId}`}
                    className="text-label-md font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {lesson.title}
                  </Link>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {lesson.category || lesson.categoryId} &middot; {formatRelativeDate(lesson.completedAt)}
                    {lesson.quizScore !== null ? ` &middot; ${lesson.quizScore}%` : ""}
                  </p>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            {completedLessons.totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={<ArrowLeft size={16} />}
                >
                  Previous
                </Button>
                <span className="text-label-md text-on-surface-variant">
                  Page {page} of {completedLessons.totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= completedLessons.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  icon={<ArrowRight size={16} />}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <Card padding="sm">
            <p className="text-label-md text-on-surface-variant">
              Complete your first lesson to see it here.
            </p>
          </Card>
        )}
      </section>

      {/* Section 5: Streak History */}
      <section>
        <h2 className="mb-4 text-headline-md text-primary">Streak History</h2>
        <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
          <div className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
            <div className="rounded-full bg-tertiary-container/40 p-3 text-tertiary">
              <Flame size={28} />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Current Streak</p>
              <p className="text-headline-md text-primary">{summary.currentStreak} days</p>
              <p className="text-label-sm text-on-surface-variant">Longest: {summary.longestStreak} days</p>
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
            <p className="mb-3 text-label-md font-semibold text-on-surface">Last 30 Days</p>
            <div className="grid grid-cols-10 gap-1.5">
              {calendarDays.map((dateStr) => {
                const isActive = activeSet.has(dateStr);
                const isToday = dateStr === today;
                return (
                  <div
                    key={dateStr}
                    className={`aspect-square rounded-md ${
                      isActive ? "bg-secondary" : "bg-surface-container"
                    } ${isToday ? "ring-2 ring-primary" : ""}`}
                    title={dateStr}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 text-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-secondary" /> Active
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-sm bg-surface-container" /> Inactive
              </span>
            </div>
            {!hasActivityToday ? (
              <p className="mt-3 text-label-sm font-medium text-primary">
                Keep your streak alive! Learn something new today.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
