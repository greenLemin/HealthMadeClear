import Skeleton from "@/components/ui/Skeleton";
import PageHeaderSkeleton from "@/components/loading/PageHeaderSkeleton";

export default function LearningPathsLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <PageHeaderSkeleton
          eyebrowWidth="120px"
          headingWidth="min(100%, 18rem)"
          descriptionWidth="min(100%, 28rem)"
        />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="card" height="240px" />
          ))}
        </div>
      </div>
    </div>
  );
}
