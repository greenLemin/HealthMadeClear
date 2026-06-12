import Skeleton from "@/components/ui/Skeleton";
import StatCardSkeleton from "@/components/dashboard/skeletons/StatCardSkeleton";
import ActivityFeedSkeleton from "@/components/dashboard/skeletons/ActivityFeedSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <section>
        <Skeleton variant="text" width="180px" />
        <Skeleton variant="heading" width="320px" />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>

      <section>
        <Skeleton variant="heading" width="200px" />
        <div className="mt-4 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <Skeleton variant="text" width="120px" />
          <Skeleton variant="heading" width="60%" />
          <div className="mt-4">
            <Skeleton variant="text" />
          </div>
        </div>
      </section>

      <section>
        <Skeleton variant="heading" width="200px" />
        <ActivityFeedSkeleton />
      </section>
    </div>
  );
}
