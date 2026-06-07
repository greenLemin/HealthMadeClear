export default function LearnLoading() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="mb-8 h-8 w-56 animate-pulse rounded-lg bg-surface-container" />
        <div className="mb-6 h-5 w-96 animate-pulse rounded bg-surface-container" />
        <div className="mb-10 h-12 w-full animate-pulse rounded-lg bg-surface-container" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-surface-container" />
          ))}
        </div>
      </div>
    </main>
  );
}
