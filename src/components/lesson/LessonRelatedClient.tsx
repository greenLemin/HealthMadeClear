"use client";

import { Link } from "@/i18n/navigation";
import Card from "@/components/ui/Card";
import { useTranslations } from "next-intl";
import type { Lesson } from "@/types/lesson";

type Props = {
  relatedLessons: Lesson[];
};

export default function LessonRelatedClient({ relatedLessons }: Props) {
  const tLearn = useTranslations("learn");
  const tCommon = useTranslations("common");

  if (relatedLessons.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-headline-lg text-primary">{tLearn("keepLearning")}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {relatedLessons.map((item) => (
          <Card as={Link} key={item.id} href={`/learn/${item.id}`} clickable>
            <h3 className="mb-3 text-headline-md text-primary">{item.title}</h3>
            <p className="mb-4 text-body-md text-on-surface-variant">{item.description}</p>
            <span className="text-label-md font-semibold text-primary">{tCommon("readLesson")}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
