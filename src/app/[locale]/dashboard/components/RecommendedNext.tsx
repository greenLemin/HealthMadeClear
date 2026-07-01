import { Link } from "@/i18n/navigation";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import type { RecommendedLesson, LearningPathEntry } from "../types";

type RecommendedNextProps = {
  isFirstVisit: boolean;
  recommendedNext: RecommendedLesson | null;
  activePaths: LearningPathEntry[];
};

export default function RecommendedNext({
  isFirstVisit,
  recommendedNext,
  activePaths,
}: RecommendedNextProps) {
  const t = useTranslations("dashboard");

  return (
    <section>
      <h2 className="mb-4 font-display text-headline-md text-primary">{t("continueLearning")}</h2>
      {isFirstVisit && recommendedNext ? (
        <Card padding="md" variant="accent" className="border-secondary/30 bg-secondary-container/20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-label-sm font-semibold text-secondary">{t("recommendedForYou")}</p>
              <h3 className="font-display text-headline-md text-primary">{recommendedNext.title}</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">{recommendedNext.description}</p>
              <div className="mt-2 flex items-center gap-3 text-label-sm text-on-surface-variant">
                <span>{recommendedNext.duration}</span>
                {recommendedNext.pathTitle ? (
                  <span>{t("partOfPath", { path: recommendedNext.pathTitle })}</span>
                ) : null}
              </div>
            </div>
            <div className="shrink-0">
              <Link href={`/learn/${recommendedNext.id}`}>
                <Button size="lg" icon={<Sparkles size={20} />}>
                  {t("beginYourJourney")}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : activePaths.length > 0 ? (
        (() => {
          const active = activePaths[0];
          return (
            <Card padding="md" className="border-primary/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-label-sm font-semibold text-primary">{active.path.title}</p>
                  <h3 className="font-display text-headline-md text-primary">
                    {active.nextLesson?.title ?? t("allLessonsComplete")}
                  </h3>
                  <div className="mt-3 max-w-md">
                    <ProgressBar
                      value={active.progressPercentage}
                      label={t("lessonXofY", {
                        current: active.completedLessonIds.length + 1,
                        total: active.path.lessons.length,
                      })}
                      showPercentage
                      size="sm"
                    />
                  </div>
                </div>
                {active.nextLesson ? (
                  <div className="shrink-0">
                    <Link href={`/learn/${active.nextLesson.id}`}>
                      <Button size="lg" icon={<ArrowRight size={20} />}>
                        {t("continueCta")}
                      </Button>
                    </Link>
                  </div>
                ) : null}
              </div>
            </Card>
          );
        })()
      ) : (
        <Card padding="md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-headline-md text-primary">{t("allCaughtUpTitle")}</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">{t("allCaughtUpDesc")}</p>
            </div>
            <Link href="/learning-paths">
              <Button variant="secondary" icon={<BookOpen size={20} />}>
                {t("browsePaths")}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </section>
  );
}
