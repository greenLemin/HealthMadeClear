import { notFound } from "next/navigation";
import { lessons } from "@/data/lessons";
import { getLessonById } from "@/lib/localizedContent";
import { getSiteUrl } from "@/lib/site";
import LessonPageClient from "./LessonPageClient";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.id }));
}

export function generateMetadata({ params }: Props) {
  const lesson = getLessonById(params.slug, "en");
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.title,
    description: lesson.description,
    openGraph: {
      title: lesson.title,
      description: lesson.description,
      url: `${getSiteUrl()}/learn/${lesson.id}`,
    },
  };
}

export default function LessonDetailPage({ params }: Props) {
  if (!getLessonById(params.slug, "en")) {
    notFound();
  }

  return <LessonPageClient slug={params.slug} />;
}
