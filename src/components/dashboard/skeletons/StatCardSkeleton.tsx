import Skeleton from "@/components/ui/Skeleton";

export default function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Skeleton variant="button" width="44px" height="44px" />
        <div className="flex-1">
          <Skeleton variant="text" width="60px" />
          <Skeleton variant="text" width="90px" />
        </div>
      </div>
    </div>
  );
}
