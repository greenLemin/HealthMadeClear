import Skeleton from "@/components/ui/Skeleton";

export default function GlossaryLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width="min(100%, 12rem)" className="mb-8" />
        <Skeleton variant="text" width="min(100%, 20rem)" className="mb-6" />
        <Skeleton variant="button" width="min(100%, 36rem)" height="48px" className="mb-8" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height="176px" />
          ))}
        </div>
      </div>
    </div>
  );
}
