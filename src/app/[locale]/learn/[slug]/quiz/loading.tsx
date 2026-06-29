import Skeleton from "@/components/ui/Skeleton";

export default function QuizLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="min(100%, 12rem)" className="mb-6" />
        <Skeleton variant="heading" width="min(100%, 20rem)" className="mb-4" />
        <Skeleton variant="text" width="min(100%, 16rem)" className="mb-8" />
        <Skeleton variant="card" height="360px" className="max-w-2xl" />
      </div>
    </div>
  );
}
