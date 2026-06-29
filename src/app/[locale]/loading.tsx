import Skeleton from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="200px" className="mb-4" />
        <Skeleton variant="heading" width="min(100%, 24rem)" className="mb-4" />
        <Skeleton variant="text" lines={2} className="mb-8 max-w-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height="200px" />
          ))}
        </div>
      </div>
    </div>
  );
}
