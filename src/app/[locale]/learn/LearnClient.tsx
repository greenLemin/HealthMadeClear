"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import LessonCard from "@/components/learn/LessonCard";
import PageHeader from "@/components/PageHeader";
import { getCategoryLabel } from "@/lib/i18n";
import { LESSON_CATEGORY_IDS } from "@/types/content";
import type { LessonListItem } from "@/types/lesson";
import { useTranslations } from "next-intl";

const ALL = "all";
type Difficulty = "all" | "beginner" | "intermediate" | "advanced";
type CategoryFilter = typeof ALL | (typeof LESSON_CATEGORY_IDS)[number];

type LearnClientProps = {
  lessons: LessonListItem[];
};

export default function LearnClient({ lessons }: LearnClientProps) {
  const [query, setQuery] = useState("");
  const { completedLessons, locale, markLessonViewed } = useAppState();
  const t = useTranslations("learn");
  const tCommon = useTranslations("common");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(ALL);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty>(ALL);

  const categoryFilters: { id: CategoryFilter; label: string }[] = useMemo(
    () => [
      { id: ALL, label: tCommon("allTopics") },
      ...LESSON_CATEGORY_IDS.map((id) => ({ id, label: getCategoryLabel(id, locale) })),
    ],
    [locale, tCommon]
  );

  const difficultyFilters: { id: Difficulty; label: string }[] = [
    { id: ALL, label: tCommon("all") },
    { id: "beginner", label: tCommon("beginner") },
    { id: "intermediate", label: tCommon("intermediate") },
    { id: "advanced", label: tCommon("advanced") },
  ];

  const filteredLessons = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return lessons.filter((lesson) => {
      const categoryLabel = getCategoryLabel(lesson.categoryId, locale);
      const matchesQuery =
        lesson.title.toLowerCase().includes(lowerQuery) ||
        lesson.description.toLowerCase().includes(lowerQuery) ||
        categoryLabel.toLowerCase().includes(lowerQuery);
      const matchesCategory = activeCategory === ALL || lesson.categoryId === activeCategory;
      const matchesDifficulty = activeDifficulty === ALL || lesson.level === activeDifficulty;
      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [activeCategory, activeDifficulty, lessons, locale, query]);

  const featuredLessons = filteredLessons.length <= 2 ? filteredLessons : filteredLessons.slice(0, 2);
  const libraryLessons = filteredLessons.length <= 2 ? [] : filteredLessons.slice(2);

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={t("title")} description={t("description")}>
          <label className="relative mt-6 block text-left">
            <span className="sr-only">{tCommon("searchLessons")}</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              size={18}
            />
            <input
              className="input-field pl-12"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tCommon("searchLessons")}
              aria-describedby="learn-results-count"
            />
          </label>
        </PageHeader>

        <div className="mb-6 flex flex-wrap gap-3">
          {categoryFilters.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
              className={
                activeCategory === category.id
                  ? "rounded-full bg-secondary-container px-4 py-2 text-label-md font-semibold text-primary"
                  : "rounded-full border border-outline-variant bg-surface px-4 py-2 text-label-md font-semibold text-on-surface-variant"
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {difficultyFilters.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDifficulty(d.id)}
              aria-pressed={activeDifficulty === d.id}
              className={
                activeDifficulty === d.id
                  ? "rounded-full bg-primary-container px-4 py-1 text-label-md font-semibold text-on-primary-container"
                  : "rounded-full border border-outline-variant bg-surface px-4 py-1 text-label-md font-semibold text-on-surface-variant"
              }
            >
              {d.label}
            </button>
          ))}
        </div>

        <div
          id="learn-results-count"
          className="mb-4 text-label-md text-on-surface-variant"
          aria-live="polite"
        >
          {filteredLessons.length > 0
            ? `Showing ${filteredLessons.length} ${filteredLessons.length === 1 ? "lesson" : "lessons"}`
            : tCommon("noLessonsFound")}
        </div>

        {featuredLessons.length > 0 ? (
          <section className="mb-14">
            <h2 className="mb-6 text-headline-lg text-primary">{tCommon("recommended")}</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredLessons.map((lesson) => (
                <div key={lesson.id} onClick={() => markLessonViewed(lesson.id)}>
                  <LessonCard lesson={lesson} isComplete={completedLessons.includes(lesson.id)} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {libraryLessons.length > 0 ? (
          <section>
            <h2 className="mb-6 text-headline-lg text-primary">{tCommon("exploreLibrary")}</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {libraryLessons.map((lesson) => (
                <div key={lesson.id} onClick={() => markLessonViewed(lesson.id)}>
                  <LessonCard lesson={lesson} isComplete={completedLessons.includes(lesson.id)} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {filteredLessons.length === 0 ? (
          <div className="card mt-6 text-center" role="status">
            <p className="text-body-md text-on-surface-variant">{tCommon("noLessonsTryBroader")}</p>
            <button
              type="button"
              className="btn-secondary mt-4 inline-flex items-center"
              onClick={() => {
                setQuery("");
                setActiveCategory(ALL);
                setActiveDifficulty(ALL);
              }}
            >
              {tCommon("showAllLessons")}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
