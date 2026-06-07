export default function GlossaryLoading() {
  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-surface-container" />
        <div className="mb-6 h-5 w-80 animate-pulse rounded bg-surface-container" />
        <div className="mb-8 h-12 w-full max-w-xl animate-pulse rounded-lg bg-surface-container" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-lg bg-surface-container" />
          ))}
        </div>
      </div>
    </main>
  );
}
