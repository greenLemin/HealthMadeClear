"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";
import { formatLevel, getMessages } from "@/lib/i18n";
import { getLessons } from "@/lib/localizedContent";

export default function LearnPage() {
  const [query, setQuery] = useState("");
  const { completedLessons, locale, markLessonViewed } = useAppState();
  const copy = getMessages(locale);
  const lessons = getLessons(locale);
  const allTopicsLabel = copy.common.allTopics;
  const [activeCategory, setActiveCategory] = useState<string>(allTopicsLabel);

  const categories = useMemo(
    () => [allTopicsLabel, ...Array.from(new Set(lessons.map((lesson) => lesson.category)))],
    [allTopicsLabel, lessons]
  );

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesQuery =
        lesson.title.toLowerCase().includes(query.toLowerCase()) ||
        lesson.description.toLowerCase().includes(query.toLowerCase()) ||
        lesson.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === allTopicsLabel || lesson.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [activeCategory, allTopicsLabel, lessons, query]);

  const featuredLessons = filteredLessons.length <= 2 ? filteredLessons : filteredLessons.slice(0, 2);
  const libraryLessons = filteredLessons.length <= 2 ? [] : filteredLessons.slice(2);

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader centered title={copy.learn.title} description={copy.learn.description}>
          <label className="relative mt-6 block text-left">
            <span className="sr-only">{copy.common.searchLessons}</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              className="input-field pl-12"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.common.searchLessons}
              aria-describedby="learn-results-count"
            />
          </label>
        </PageHeader>

        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={
                activeCategory === category
                  ? "rounded-full bg-secondary-container px-4 py-2 text-sm font-semibold text-primary"
                  : "rounded-full border border-outline-variant bg-surface px-4 py-2 text-sm font-semibold text-on-surface-variant"
              }
            >
              {category}
            </button>
          ))}
        </div>

        <div id="learn-results-count" className="mb-4 text-sm text-on-surface-variant" aria-live="polite">
          {filteredLessons.length > 0
            ? `${filteredLessons.length} ${copy.common.lessonsFound}`
            : copy.common.noLessonsFound}
        </div>

        {featuredLessons.length > 0 ? (
        <section className="mb-14">
          <h2 className="mb-6 text-headline-lg text-primary">{copy.common.recommended}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {featuredLessons.map((lesson, index) => (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
                onClick={() => markLessonViewed(lesson.id)}
              >
                <div className="grid h-full md:grid-cols-[0.9fr_1.1fr]">
                  <div className={index === 0 ? "min-h-56 bg-gradient-to-br from-primary-container to-secondary-container" : "min-h-56 bg-gradient-to-br from-secondary-container to-primary-fixed"} />
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
                      <span>{completedLessons.includes(lesson.id) ? copy.common.completed : copy.common.ready}</span>
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
          <h2 className="mb-6 text-headline-lg text-primary">{copy.common.exploreLibrary}</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {libraryLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/learn/${lesson.id}`}
                className="card-hover"
                onClick={() => markLessonViewed(lesson.id)}
              >
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
                  {lesson.category}
                </div>
                <h3 className="mb-3 text-headline-md text-primary">{lesson.title}</h3>
                <p className="mb-4 text-body-md text-on-surface-variant">{lesson.description}</p>
                <div className="flex items-center justify-between text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {lesson.duration}
                  </span>
                  <span>{completedLessons.includes(lesson.id) ? copy.common.completed : formatLevel(lesson.level, locale)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        ) : null}

        {filteredLessons.length === 0 ? (
          <div className="card mt-6 text-center" role="status">
            <p className="text-body-md text-on-surface-variant">{copy.common.noLessonsTryBroader}</p>
            <button
              type="button"
              className="btn-secondary mt-4 inline-flex items-center"
              onClick={() => {
                setQuery("");
                setActiveCategory(allTopicsLabel);
              }}
            >
              {copy.common.showAllLessons}
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
