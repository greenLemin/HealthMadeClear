import Skeleton from "@/components/ui/Skeleton";
import StatCardSkeleton from "@/components/dashboard/skeletons/StatCardSkeleton";
import LearningPathCardSkeleton from "@/components/dashboard/skeletons/LearningPathCardSkeleton";
import ActivityFeedSkeleton from "@/components/dashboard/skeletons/ActivityFeedSkeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <section className="section-frame px-6 py-8 md:px-8 md:py-10">
        <Skeleton variant="text" width="132px" className="mb-4" />
        <Skeleton variant="heading" width="320px" className="max-w-full" />
        <Skeleton variant="text" width="68%" className="mt-4 max-w-2xl" />
        <div className="mt-6 flex flex-wrap gap-3">
          <Skeleton variant="button" width="148px" height="44px" className="rounded-full" />
          <Skeleton variant="button" width="128px" height="44px" className="rounded-full" />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="148px" />
              <Skeleton variant="heading" width="320px" className="max-w-full" />
              <Skeleton variant="text" lines={2} className="max-w-xl" />
              <div className="flex flex-wrap gap-3 pt-2">
                <Skeleton variant="button" width="126px" height="42px" className="rounded-full" />
                <Skeleton variant="button" width="102px" height="42px" className="rounded-full" />
              </div>
            </div>
            <div className="surface-card flex min-h-[180px] items-center justify-center px-6 py-6">
              <Skeleton variant="avatar" width="156px" height="156px" className="rounded-full" />
            </div>
          </div>
        </div>
        <div className="surface-card-muted px-6 py-6 md:px-8 md:py-8">
          <Skeleton variant="text" width="160px" className="mb-4" />
          <Skeleton variant="heading" width="220px" />
          <Skeleton variant="text" lines={3} className="mt-4" />
          <div className="mt-6 space-y-3">
            <Skeleton variant="button" width="100%" height="10px" className="rounded-full" />
            <Skeleton variant="button" width="72%" height="10px" className="rounded-full" />
          </div>
        </div>
      </section>

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

      <section>
        <div className="mb-4">
          <Skeleton variant="heading" width="180px" />
        </div>
        <ActivityFeedSkeleton />
      </section>
    </div>
  );
}
