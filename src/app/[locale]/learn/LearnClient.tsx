"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Clock, Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import LessonThumbnail from "@/components/LessonThumbnail";
import PageHeader from "@/components/PageHeader";
import { formatLevel, getCategoryLabel } from "@/lib/i18n";
import { LESSON_CATEGORY_IDS } from "@/types/content";
import type { LessonListItem } from "@/types/lesson";
import { useTranslations } from "next-intl";

const ALL_CATEGORIES = "all";

type CategoryFilter = typeof ALL_CATEGORIES | (typeof LESSON_CATEGORY_IDS)[number];

type LearnClientProps = {
  lessons: LessonListItem[];
};

export default function LearnClient({ lessons }: LearnClientProps) {
  const [query, setQuery] = useState("");
  const { completedLessons, locale, markLessonViewed } = useAppState();
  const t = useTranslations("learn");
  const tCommon = useTranslations("common");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(ALL_CATEGORIES);

  const categoryFilters: { id: CategoryFilter; label: string }[] = useMemo(
    () => [
      { id: ALL_CATEGORIES, label: tCommon("allTopics") },
      ...LESSON_CATEGORY_IDS.map((id) => ({ id, label: getCategoryLabel(id, locale) })),
    ],
    [locale, tCommon]
  );

  const filteredLessons = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return lessons.filter((lesson) => {
      const categoryLabel = getCategoryLabel(lesson.categoryId, locale);
      const matchesQuery =
        lesson.title.toLowerCase().includes(lowerQuery) ||
        lesson.description.toLowerCase().includes(lowerQuery) ||
        categoryLabel.toLowerCase().includes(lowerQuery);
      const matchesCategory = activeCategory === ALL_CATEGORIES || lesson.categoryId === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, lessons, locale, query]);

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

        <div className="mb-10 flex flex-wrap gap-3">
          {categoryFilters.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={activeCategory === category.id}
              className={
                activeCategory === category.id
                  ? "rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary"
                  : "rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm font-semibold text-on-surface-variant"
              }
            >
              {category.label}
            </button>
          ))}
        </div>

        <div id="learn-results-count" className="mb-4 text-sm text-on-surface-variant" aria-live="polite">
          {filteredLessons.length > 0
            ? `${filteredLessons.length} ${tCommon("lessonsFound")}`
            : tCommon("noLessonsFound")}
        </div>

        {featuredLessons.length > 0 ? (
          <section className="mb-14">
            <h2 className="mb-6 text-headline-lg text-primary">{tCommon("recommended")}</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {featuredLessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id}`}
                  className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
                  onClick={() => markLessonViewed(lesson.id)}
                >
                  <div className="grid h-full md:grid-cols-[0.9fr_1.1fr]">
                    <LessonThumbnail
                      image={lesson.image}
                      categoryId={lesson.categoryId}
                      title={lesson.title}
                      className="min-h-56"
                      priority={index === 0}
                    />
                    <div className="p-6">
                      <div className="mb-3 inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-primary">
                        {formatLevel(lesson.level, locale)}
                      </div>
                      <h3 className="mb-3 text-headline-md text-primary">{lesson.title}</h3>
                      <p className="mb-4 text-body-md text-on-surface-variant">{lesson.description}</p>
                      <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {lesson.duration}
                        </span>
                        <span>
                          {completedLessons.includes(lesson.id) ? tCommon("completed") : tCommon("ready")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {libraryLessons.length > 0 ? (
          <section>
            <h2 className="mb-6 text-headline-lg text-primary">{tCommon("exploreLibrary")}</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {libraryLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.id}`}
                  className="card-hover"
                  onClick={() => markLessonViewed(lesson.id)}
                >
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                    {getCategoryLabel(lesson.categoryId, locale)}
                  </div>
                  <h3 className="mb-3 text-headline-md text-primary">{lesson.title}</h3>
                  <p className="mb-4 text-body-md text-on-surface-variant">{lesson.description}</p>
                  <div className="flex items-center justify-between text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {lesson.duration}
                    </span>
                    <span>
                      {completedLessons.includes(lesson.id)
                        ? tCommon("completed")
                        : formatLevel(lesson.level, locale)}
                    </span>
                  </div>
                </Link>
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
                setActiveCategory(ALL_CATEGORIES);
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
