import { formatRelativeDate } from "@/lib/i18n";

export type AchievementItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
};

interface AchievementCardProps {
  achievement: AchievementItem;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl p-6 text-center transition-all ${
        achievement.earned
          ? "border-2 border-secondary/30 bg-surface-container-lowest shadow-card"
          : "border-2 border-dashed border-outline-variant bg-surface-container"
      }`}
    >
      <span
        className={`text-headline-xl ${achievement.earned ? "" : "opacity-30 grayscale"}`}
        aria-hidden="true"
      >
        {achievement.icon}
      </span>
      <p
        className={`mt-3 text-label-md font-semibold ${
          achievement.earned ? "text-on-surface" : "text-on-surface-variant"
        }`}
      >
        {achievement.title}
      </p>
      {achievement.earned ? (
        <>
          <p className="mt-1 text-label-sm text-on-surface-variant">{achievement.description}</p>
          {achievement.earnedAt ? (
            <p className="mt-1 text-label-sm text-secondary">{formatRelativeDate(achievement.earnedAt)}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-1 text-label-sm text-on-surface-variant">Keep learning to unlock</p>
      )}
    </div>
  );
}
