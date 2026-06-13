import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { lessons } from "@/data/lessons";
import { getLessonById } from "@/lib/localizedContent";
import { getQuizByLessonId } from "@/lib/localizedQuiz";
import { requireLocale } from "@/lib/locale";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import QuizClientWrapper from "./QuizClientWrapper";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => lessons.map((lesson) => ({ locale, slug: lesson.id })));
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const lesson = getLessonById(slug, requireLocale(locale));
  if (!lesson) return { title: "Quiz not found" };
  return {
    title: `${lesson.title} — Quiz`,
    description: `Test your knowledge: ${lesson.description}`,
  };
}

export default async function QuizPage({ params }: Props) {
  const { locale, slug } = await params;
  const lesson = getLessonById(slug, requireLocale(locale));
  if (!lesson) notFound();

  const quiz = getQuizByLessonId(slug, requireLocale(locale));
  if (!quiz) notFound();

  const base = getSiteUrl();
  const url = `${base}/${locale}/learn/${quiz.lessonId}/quiz`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: quiz.title,
          description: `Quiz for ${lesson.title}`,
          inLanguage: locale,
          url,
          learningResourceType: "Quiz",
          educationalLevel: lesson.level,
        }}
      />
      <QuizClientWrapper quiz={quiz} lessonTitle={lesson.title} lessonId={lesson.id} />
    </>
  );
}
