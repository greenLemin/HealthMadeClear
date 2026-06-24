import Skeleton from "@/components/ui/Skeleton";
import StatCardSkeleton from "@/components/dashboard/skeletons/StatCardSkeleton";
import LearningPathCardSkeleton from "@/components/dashboard/skeletons/LearningPathCardSkeleton";
import ActivityFeedSkeleton from "@/components/dashboard/skeletons/ActivityFeedSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      {/* Welcome Header Skeleton */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Skeleton variant="text" width="120px" className="mb-2" />
          <Skeleton variant="heading" width="280px" />
        </div>
        <div className="flex gap-3">
          <Skeleton variant="button" width="130px" height="40px" />
          <Skeleton variant="button" width="130px" height="40px" />
        </div>
      </section>

      {/* Stats Grid Skeleton */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </section>

      {/* Continue Learning Skeleton */}
      <section>
        <div className="mb-4">
          <Skeleton variant="text" width="200px" height="24px" />
        </div>
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="150px" />
              <Skeleton variant="heading" width="300px" />
              <Skeleton variant="text" width="450px" />
            </div>
            <div className="shrink-0">
              <Skeleton variant="button" width="160px" height="48px" />
            </div>
          </div>
        </div>
      </section>

      {/* My Learning Paths Skeleton */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <Skeleton variant="heading" width="220px" />
          <Skeleton variant="text" width="140px" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <LearningPathCardSkeleton />
          <LearningPathCardSkeleton />
        </div>
      </section>

      {/* Recent Activity Skeleton */}
      <section>
        <div className="mb-4">
          <Skeleton variant="heading" width="180px" />
        </div>
        <ActivityFeedSkeleton />
      </section>
    </div>
  );
}
