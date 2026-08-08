"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import LessonCard from "@/components/learn/LessonCard";
import PageHeader from "@/components/PageHeader";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
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
  const difficultyLabel = t("difficultyLabel");
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

  const featuredLessons = useMemo(
    () => (filteredLessons.length <= 2 ? filteredLessons : filteredLessons.slice(0, 2)),
    [filteredLessons]
  );

  const libraryLessons = useMemo(
    () => (filteredLessons.length <= 2 ? [] : filteredLessons.slice(2)),
    [filteredLessons]
  );

  const groupedLibraryLessons = useMemo(() => {
    if (activeCategory !== ALL) {
      return null;
    }
    const groups: Record<string, LessonListItem[]> = {};
    for (const lesson of libraryLessons) {
      if (!groups[lesson.categoryId]) {
        groups[lesson.categoryId] = [];
      }
      groups[lesson.categoryId].push(lesson);
    }
    return groups;
  }, [libraryLessons, activeCategory]);

  return (
    <div className="px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-container">
        <PageHeader centered title={t("title")} description={t("description")} className="mb-8">
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

        <div className="surface-card-glass mb-4 p-4">
          <div className="mb-3 text-label-md font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            {tCommon("category")}
          </div>
          <div className="flex flex-wrap gap-3">
            {categoryFilters.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={activeCategory === category.id}
                className={["chip px-4 py-3", activeCategory === category.id ? "chip-active" : ""].join(" ")}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="surface-card-glass mb-6 p-4">
          <div className="mb-3 text-label-md font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            {difficultyLabel}
          </div>
          <div className="flex flex-wrap gap-3">
            {difficultyFilters.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setActiveDifficulty(d.id)}
                aria-pressed={activeDifficulty === d.id}
                className={["chip px-4 py-2", activeDifficulty === d.id ? "chip-active" : ""].join(" ")}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div
          id="learn-results-count"
          className="mb-6 text-label-md text-on-surface-variant"
          aria-live="polite"
        >
          {filteredLessons.length > 0 ? t("showingLessons", { count: filteredLessons.length }) : ""}
        </div>

        {featuredLessons.length > 0 ? (
          <section className="mb-14">
            <h2 className="mb-6 font-display text-headline-lg text-primary">{tCommon("recommended")}</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredLessons.map((lesson, index) => (
                <Reveal key={lesson.id} delay={index * 0.05}>
                  <LessonCard
                    lesson={lesson}
                    isComplete={completedLessons.has(lesson.id)}
                    onNavigate={() => markLessonViewed(lesson.id)}
                  />
                </Reveal>
              ))}
            </div>
          </section>
        ) : null}

        {libraryLessons.length > 0 ? (
          <section>
            <h2 className="mb-8 font-display text-headline-lg text-primary">{tCommon("exploreLibrary")}</h2>
            {groupedLibraryLessons ? (
              <div className="space-y-12">
                {Object.entries(groupedLibraryLessons).map(([categoryId, groupLessons]) => (
                  <div
                    key={categoryId}
                    className="border-t border-outline-variant/40 pt-8 first:border-t-0 first:pt-0"
                  >
                    <h3 className="mb-6 font-display text-headline-md text-primary">
                      {getCategoryLabel(categoryId as any, locale)}
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {groupLessons.map((lesson, index) => (
                        <Reveal key={lesson.id} delay={(index % 3) * 0.04}>
                          <LessonCard
                            lesson={lesson}
                            isComplete={completedLessons.has(lesson.id)}
                            onNavigate={() => markLessonViewed(lesson.id)}
                          />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {libraryLessons.map((lesson, index) => (
                  <Reveal key={lesson.id} delay={(index % 3) * 0.04}>
                    <LessonCard
                      lesson={lesson}
                      isComplete={completedLessons.has(lesson.id)}
                      onNavigate={() => markLessonViewed(lesson.id)}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {filteredLessons.length === 0 ? (
          <EmptyState
            variant="learning"
            title={tCommon("noLessonsFound")}
            description={tCommon("noLessonsTryBroader")}
            action={{
              label: tCommon("showAllLessons"),
              onClick: () => {
                setQuery("");
                setActiveCategory(ALL);
                setActiveDifficulty(ALL);
              },
            }}
            className="mt-8"
          />
        ) : null}

        <MedicalDisclaimer />
      </div>
    </div>
  );
}
