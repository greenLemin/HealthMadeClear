import Skeleton from "@/components/ui/Skeleton";

export default function ActivityFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="surface-card-muted flex items-start gap-4 px-5 py-5">
          <Skeleton variant="button" width="40px" height="40px" className="rounded-full" />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="42%" className="mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}
