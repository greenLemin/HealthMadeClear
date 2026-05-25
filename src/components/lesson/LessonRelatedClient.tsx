"use client";

import { Link } from "@/i18n/navigation";
import { useAppState } from "@/components/AppProviders";
import { getMessages } from "@/lib/i18n";
import { getLessons } from "@/lib/localizedContent";
import type { LessonCategoryId, LessonId } from "@/types/content";

export default function LessonRelatedClient({
  lessonId,
  categoryId,
}: {
  lessonId: LessonId;
  categoryId: LessonCategoryId;
}) {
  const { locale } = useAppState();
  const copy = getMessages(locale);
  const relatedLessons = getLessons(locale)
    .filter((item) => item.id !== lessonId && item.categoryId === categoryId)
    .slice(0, 3);

  if (relatedLessons.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-headline-lg text-primary">{copy.learn.keepLearning}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {relatedLessons.map((item) => (
          <Link key={item.id} href={`/learn/${item.id}`} className="card-hover">
            <h3 className="mb-3 text-headline-md text-primary">{item.title}</h3>
            <p className="mb-4 text-body-md text-on-surface-variant">{item.description}</p>
            <span className="text-sm font-semibold text-primary">{copy.common.readLesson}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
