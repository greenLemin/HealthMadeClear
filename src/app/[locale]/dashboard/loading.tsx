export default function DashboardLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="mb-8 h-8 w-56 animate-pulse rounded-lg bg-surface-container" />
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-container" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-lg bg-surface-container" />
          <div className="h-72 animate-pulse rounded-lg bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
