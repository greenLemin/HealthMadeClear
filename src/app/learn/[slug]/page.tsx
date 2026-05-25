"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Printer } from "lucide-react";
import { useAppState } from "@/components/AppProviders";
import { formatLevel } from "@/lib/i18n";
import { getLessonById, getLessons } from "@/lib/localizedContent";

export default function LessonDetailPage({ params }: { params: { slug: string } }) {
  const { completedLessons, locale, toggleLessonComplete, markLessonViewed } = useAppState();
  const lessons = getLessons(locale);
  const lesson = useMemo(() => getLessonById(params.slug, locale), [locale, params.slug]);

  useEffect(() => {
    if (lesson) {
      markLessonViewed(lesson.id);
    }
  }, [lesson, markLessonViewed]);

  if (!lesson) {
    return (
      <main className="py-16">
        <div className="max-w-container mx-auto px-4 md:px-6">
          <div className="card text-center">
            <h1 className="mb-3 text-headline-lg text-primary">{locale === "es" ? "Lección no encontrada" : "Lesson not found"}</h1>
            <p className="mb-6 text-body-md text-on-surface-variant">
              {locale === "es" ? "La lección que buscas no está disponible en este momento." : "The lesson you are looking for is not available right now."}
            </p>
            <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft size={18} />
              {locale === "es" ? "Volver a la biblioteca" : "Back to library"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isCompleted = completedLessons.includes(lesson.id);
  const relatedLessons = lessons.filter((item) => item.id !== lesson.id && item.category === lesson.category).slice(0, 3);

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
          <span className="rounded-full bg-surface-container px-3 py-1">{lesson.duration}</span>
          <span className="rounded-full bg-surface-container px-3 py-1">{formatLevel(lesson.level, locale)}</span>
          <span className="rounded-full bg-surface-container px-3 py-1">{lesson.category}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.55fr]">
          <article>
            <Link href="/learn" className="no-print mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <ArrowLeft size={18} />
              {locale === "es" ? "Volver a las lecciones" : "Back to lessons"}
            </Link>
            <h1 className="mb-4 text-headline-xl text-primary">{lesson.title}</h1>
            <p className="mb-8 max-w-3xl text-body-lg text-on-surface-variant">{lesson.description}</p>
            <div className="no-print mb-8 flex flex-wrap gap-3">
              <button
                type="button"
                className={isCompleted ? "btn-secondary inline-flex items-center gap-2" : "btn-primary inline-flex items-center gap-2"}
                onClick={() => toggleLessonComplete(lesson.id)}
              >
                <CheckCircle2 size={18} />
                {isCompleted ? (locale === "es" ? "Marcar como no completada" : "Mark as not done") : (locale === "es" ? "Marcar como completada" : "Mark as complete")}
              </button>
              <button type="button" className="btn-secondary inline-flex items-center gap-2" onClick={() => window.print()}>
                <Printer size={18} />
                {locale === "es" ? "Imprimir lección" : "Print lesson"}
              </button>
            </div>

            <div className="mb-8 rounded-lg border border-outline-variant bg-gradient-to-br from-surface-container-low to-surface p-6">
              <div className="min-h-72 rounded-lg bg-gradient-to-br from-primary-container to-primary-fixed" />
            </div>

            <div className="space-y-8">
              {lesson.content.sections.map((section, index) => (
                <section key={section.title}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <h2 className="text-headline-md text-primary">{section.title}</h2>
                  </div>
                  <div className="whitespace-pre-line text-body-md text-on-surface-variant">{section.content}</div>
                  {section.callouts?.map((callout, calloutIndex) => (
                    <div
                      key={`${section.title}-${calloutIndex}`}
                      className={
                        callout.type === "warning"
                          ? "callout-warning mt-4"
                          : callout.type === "success"
                            ? "callout-success mt-4"
                            : "callout-info mt-4"
                      }
                    >
                      <p className="text-body-md text-on-surface">{callout.content}</p>
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </article>

          <aside className="space-y-6">
            <div className="card sticky top-24">
              <h3 className="mb-3 text-headline-md text-primary">{locale === "es" ? "¿Todavía tienes dudas?" : "Still confused?"}</h3>
              <p className="mb-4 text-body-md text-on-surface-variant">
                {locale === "es" ? "Lleva estas preguntas a tu próxima cita o visita a la farmacia." : "Bring these questions to your next visit or pharmacy stop."}
              </p>
              <ul className="space-y-3 text-body-md text-on-surface-variant">
                <li>{locale === "es" ? "Revisa el nombre." : "Check the name."}</li>
                <li>{locale === "es" ? "Lee cuántas debes tomar." : "Read how many to take."}</li>
                <li>{locale === "es" ? "Busca advertencias." : "Look for warnings."}</li>
                <li>{locale === "es" ? "Pregunta qué pasa si se te olvida una dosis." : "Ask what happens if you miss a dose."}</li>
              </ul>
              <p className="mt-4 text-sm font-semibold text-primary">
                {locale === "es" ? "Los farmacéuticos pueden explicar las etiquetas con lenguaje sencillo." : "Pharmacists can explain labels in simple language."}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-16">
          <h2 className="mb-6 text-headline-lg text-primary">{locale === "es" ? "Sigue aprendiendo" : "Keep learning"}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {relatedLessons.map((item) => (
              <Link key={item.id} href={`/learn/${item.id}`} className="card-hover">
                <h3 className="mb-3 text-headline-md text-primary">{item.title}</h3>
                <p className="mb-4 text-body-md text-on-surface-variant">{item.description}</p>
                <span className="text-sm font-semibold text-primary">{locale === "es" ? "Leer lección" : "Read lesson"}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
