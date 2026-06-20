export default function DashboardLoading() {
  return (
    <div className="max-w-container mx-auto px-4 py-16 md:px-6">
      <div className="space-y-8" aria-hidden="true">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-container-high" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-container-high" />
          ))}
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-surface-container-high" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-container-high" />
      </div>
    </div>
  );
}
