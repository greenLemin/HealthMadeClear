import Skeleton from "@/components/ui/Skeleton";

export default function StatCardSkeleton() {
  return (
    <div className="surface-card px-5 py-5">
      <div className="flex items-center gap-4">
        <Skeleton variant="button" width="52px" height="52px" className="rounded-full" />
        <div className="flex-1">
          <Skeleton variant="text" width="88px" />
          <Skeleton variant="heading" width="120px" className="mt-3" />
        </div>
      </div>
    </div>
  );
}
