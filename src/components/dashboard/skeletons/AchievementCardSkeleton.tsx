import Skeleton from "@/components/ui/Skeleton";

export default function AchievementCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container p-6"
        >
          <Skeleton variant="avatar" width="48px" height="48px" />
          <Skeleton variant="text" width="80px" />
          <Skeleton variant="text" width="100px" />
        </div>
      ))}
    </div>
  );
}
