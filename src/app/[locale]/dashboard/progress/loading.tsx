import Skeleton from "@/components/ui/Skeleton";
import StatCardSkeleton from "@/components/dashboard/skeletons/StatCardSkeleton";

export default function ProgressLoading() {
  return (
    <div className="space-y-10">
      <section className="section-frame px-6 py-8 md:px-8 md:py-10">
        <Skeleton variant="text" width="180px" className="mb-4" />
        <Skeleton variant="heading" width="300px" className="max-w-full" />
        <Skeleton variant="text" width="65%" className="mt-4 max-w-2xl" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 md:grid-cols-[190px_1fr] md:items-center">
            <div className="flex items-center justify-center">
              <Skeleton variant="avatar" width="180px" height="180px" className="rounded-full" />
            </div>
            <div>
              <Skeleton variant="text" width="140px" className="mb-4" />
              <Skeleton variant="heading" width="260px" className="max-w-full" />
              <Skeleton variant="text" lines={3} className="mt-4 max-w-xl" />
              <div className="mt-6 space-y-3">
                <Skeleton variant="button" width="100%" height="12px" className="rounded-full" />
                <Skeleton variant="button" width="82%" height="12px" className="rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section>
        <Skeleton variant="heading" width="240px" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card px-6 py-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <Skeleton variant="text" width="44%" />
                <Skeleton variant="button" width="84px" height="34px" className="rounded-full" />
              </div>
              <Skeleton variant="button" width="100%" height="10px" className="rounded-full" />
              <div className="mt-4 flex flex-wrap gap-3">
                <Skeleton variant="button" width="88px" height="34px" className="rounded-full" />
                <Skeleton variant="button" width="116px" height="34px" className="rounded-full" />
              </div>
              <Skeleton variant="text" width="72%" className="mt-5" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <Skeleton variant="heading" width="220px" />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface-card-glass px-6 py-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <Skeleton variant="button" width="96px" height="34px" className="rounded-full" />
                <Skeleton variant="button" width="84px" height="34px" className="rounded-full" />
              </div>
              <Skeleton variant="heading" width="72%" className="max-w-full" />
              <Skeleton variant="text" width="48%" className="mt-4" />
              <Skeleton variant="text" width="58%" className="mt-3" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
