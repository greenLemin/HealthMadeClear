import Skeleton from "@/components/ui/Skeleton";

export default function AchievementsLoading() {
  return (
    <div className="space-y-10">
      <section>
        <Skeleton variant="text" width="160px" />
        <Skeleton variant="heading" width="200px" />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card"
          >
            <div className="mb-3 flex justify-center">
              <Skeleton variant="avatar" width="48px" height="48px" />
            </div>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </section>
    </div>
  );
}
