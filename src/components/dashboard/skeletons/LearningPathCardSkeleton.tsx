import Skeleton from "@/components/ui/Skeleton";

export default function LearningPathCardSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-card md:p-8">
      {/* Icon, level badge, duration */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton variant="avatar" width="28px" height="28px" />
        <Skeleton variant="button" width="70px" height="28px" className="rounded-full" />
        <Skeleton variant="text" width="60px" />
      </div>

      {/* Title */}
      <div className="mb-2">
        <Skeleton variant="heading" width="60%" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton variant="text" lines={2} />
      </div>

      {/* Modules */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton variant="text" width="100px" />
      </div>

      {/* Progress Bar placeholder */}
      <div className="mb-5 space-y-2">
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="button" width="100%" height="8px" className="rounded-full" />
      </div>

      {/* Button placeholder */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton variant="button" width="120px" height="44px" />
      </div>
    </div>
  );
}
