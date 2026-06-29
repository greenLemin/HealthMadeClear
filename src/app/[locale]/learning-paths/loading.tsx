import Skeleton from "@/components/ui/Skeleton";

export default function LearningPathsLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="120px" className="mb-3" />
        <Skeleton variant="heading" width="min(100%, 18rem)" className="mb-4" />
        <Skeleton variant="text" lines={2} className="mb-10 max-w-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" height="240px" />
          ))}
        </div>
      </div>
    </div>
  );
}
