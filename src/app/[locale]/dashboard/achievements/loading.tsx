import Skeleton from "@/components/ui/Skeleton";

export default function AchievementsLoading() {
  return (
    <div className="space-y-10">
      <section className="section-frame px-6 py-8 md:px-8 md:py-10">
        <Skeleton variant="text" width="160px" className="mb-4 mx-auto" />
        <Skeleton variant="heading" width="260px" className="mx-auto max-w-full" />
        <Skeleton variant="text" width="52%" className="mt-4 mx-auto" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card-strong px-6 py-6 md:px-8 md:py-8">
          <Skeleton variant="text" width="150px" className="mb-4" />
          <Skeleton variant="heading" width="220px" />
          <Skeleton variant="text" lines={2} className="mt-4 max-w-xl" />
          <div className="mt-6 space-y-3">
            <Skeleton variant="button" width="100%" height="12px" className="rounded-full" />
            <div className="flex flex-wrap gap-3">
              <Skeleton variant="button" width="110px" height="38px" className="rounded-full" />
              <Skeleton variant="button" width="120px" height="38px" className="rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="surface-card-muted px-6 py-6">
              <Skeleton variant="text" width="110px" className="mb-4" />
              <Skeleton variant="heading" width="90px" />
              <Skeleton variant="text" lines={2} className="mt-4" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="surface-card px-6 py-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <Skeleton variant="avatar" width="56px" height="56px" className="rounded-full" />
              <Skeleton variant="button" width="96px" height="34px" className="rounded-full" />
            </div>
            <Skeleton variant="heading" width="72%" className="max-w-full" />
            <Skeleton variant="text" lines={2} className="mt-4" />
          </div>
        ))}
      </section>
    </div>
  );
}
