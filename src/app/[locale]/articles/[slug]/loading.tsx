import Skeleton from "@/components/ui/Skeleton";

export default function ArticleLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="min(100%, 10rem)" className="mb-6" />
        <Skeleton variant="heading" width="min(100%, 28rem)" className="mb-4" />
        <Skeleton variant="text" lines={2} className="mb-8 max-w-2xl" />
        <Skeleton variant="card" height="480px" className="max-w-3xl" />
      </div>
    </div>
  );
}
