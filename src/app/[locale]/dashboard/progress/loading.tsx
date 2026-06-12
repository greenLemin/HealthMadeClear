import Skeleton from "@/components/ui/Skeleton";
import StatCardSkeleton from "@/components/dashboard/skeletons/StatCardSkeleton";

export default function ProgressLoading() {
  return (
    <div className="space-y-10">
      <section>
        <Skeleton variant="text" width="180px" />
        <Skeleton variant="heading" width="280px" />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </section>

      <section>
        <Skeleton variant="heading" width="220px" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card"
            >
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
