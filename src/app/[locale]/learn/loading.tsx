import Skeleton from "@/components/ui/Skeleton";

export default function LearnLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width="min(100%, 14rem)" className="mb-8" />
        <Skeleton variant="text" width="min(100%, 24rem)" className="mb-6" />
        <Skeleton variant="button" width="100%" height="48px" className="mb-10" />
        <div className="mb-6 flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="button" width="100px" height="44px" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton variant="card" height="192px" />
          <Skeleton variant="card" height="192px" />
        </div>
      </div>
    </div>
  );
}
