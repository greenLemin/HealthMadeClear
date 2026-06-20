export default function AuthLoading() {
  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-lg" aria-hidden="true">
        <div className="space-y-6">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-6 w-72 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-14 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-14 animate-pulse rounded-lg bg-surface-container-high" />
          <div className="h-14 animate-pulse rounded-lg bg-surface-container-high" />
        </div>
      </div>
    </div>
  );
}
