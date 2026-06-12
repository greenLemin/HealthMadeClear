import Skeleton from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-10">
      <section>
        <Skeleton variant="text" width="140px" />
        <Skeleton variant="heading" width="180px" />
      </section>

      <section className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card"
          >
            <Skeleton variant="heading" width="200px" />
            <div className="mt-4 space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" width="70%" />
            </div>
            <div className="mt-4">
              <Skeleton variant="button" width="160px" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
