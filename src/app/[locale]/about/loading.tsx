import Skeleton from "@/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width="min(100%, 14rem)" className="mx-auto mb-4" />
        <Skeleton variant="text" width="min(100%, 28rem)" className="mx-auto mb-8" />
        <Skeleton variant="card" height="280px" className="mx-auto mb-8 max-w-3xl" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height="180px" />
          ))}
        </div>
      </div>
    </div>
  );
}
