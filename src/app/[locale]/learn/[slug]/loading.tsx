import Skeleton from "@/components/ui/Skeleton";

export default function LessonLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="min(100%, 16rem)" className="mb-6" />
        <Skeleton variant="heading" width="min(100%, 28rem)" className="mb-4" />
        <Skeleton variant="text" lines={3} className="mb-8 max-w-3xl" />
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <Skeleton variant="card" height="480px" />
          <Skeleton variant="card" height="240px" />
        </div>
      </div>
    </div>
  );
}
