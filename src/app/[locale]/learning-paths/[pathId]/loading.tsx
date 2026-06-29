import Skeleton from "@/components/ui/Skeleton";

export default function LearningPathDetailLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="120px" className="mb-4" />
        <Skeleton variant="heading" width="min(100%, 22rem)" className="mb-4" />
        <Skeleton variant="text" lines={2} className="mb-8 max-w-2xl" />
        <Skeleton variant="card" height="80px" className="mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" height="72px" />
          ))}
        </div>
      </div>
    </div>
  );
}
