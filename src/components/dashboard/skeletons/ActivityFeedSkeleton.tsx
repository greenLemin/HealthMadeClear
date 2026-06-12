import Skeleton from "@/components/ui/Skeleton";

export default function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
        >
          <Skeleton variant="button" width="32px" height="32px" />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
