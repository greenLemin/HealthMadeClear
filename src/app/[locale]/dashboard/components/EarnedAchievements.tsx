import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Card from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/i18n";
import type { AchievementItem } from "../types";

type EarnedAchievementsProps = {
  earnedAchievements: AchievementItem[];
  locale: string;
};

export default function EarnedAchievements({ earnedAchievements, locale }: EarnedAchievementsProps) {
  const t = useTranslations("dashboard");

  if (earnedAchievements.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="font-display text-headline-md text-primary">{t("recentlyEarned")}</h2>
        <Link
          href="/dashboard/achievements"
          className="text-label-md font-semibold text-primary underline underline-offset-2"
        >
          {t("viewAllAchievements")} &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {earnedAchievements.slice(0, 4).map((achievement) => (
          <Card key={achievement.id} padding="sm" className="border-secondary/30 text-center">
            <span className="text-headline-lg" aria-hidden="true">
              {achievement.icon}
            </span>
            <p className="mt-2 text-label-sm font-semibold text-on-surface">{achievement.title}</p>
            {achievement.earnedAt ? (
              <p className="mt-1 text-label-sm text-on-surface-variant">
                {formatRelativeDate(achievement.earnedAt, locale as "en" | "es")}
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
