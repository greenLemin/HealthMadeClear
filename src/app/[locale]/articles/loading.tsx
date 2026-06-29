import Skeleton from "@/components/ui/Skeleton";

export default function ArticlesLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width="min(100%, 16rem)" className="mx-auto mb-4" />
        <Skeleton variant="text" width="min(100%, 28rem)" className="mx-auto mb-8" />
        <Skeleton variant="button" width="100%" height="48px" className="mb-10 max-w-xl mx-auto" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" height="220px" />
          ))}
        </div>
      </div>
    </div>
  );
}
