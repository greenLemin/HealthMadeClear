import Skeleton from "@/components/ui/Skeleton";
import PageHeaderSkeleton from "@/components/loading/PageHeaderSkeleton";

export default function ToolsLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <PageHeaderSkeleton
          eyebrowWidth="120px"
          headingWidth="min(100%, 14rem)"
          descriptionWidth="min(100%, 28rem)"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="card" height="200px" />
          ))}
        </div>
      </div>
    </div>
  );
}
