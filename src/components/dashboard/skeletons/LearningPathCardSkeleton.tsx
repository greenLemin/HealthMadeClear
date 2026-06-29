import Skeleton from "@/components/ui/Skeleton";

export default function LearningPathCardSkeleton() {
  return (
    <div className="surface-card px-6 py-6 md:px-8 md:py-8">
      {/* Icon, level badge, duration */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton variant="avatar" width="32px" height="32px" />
        <Skeleton variant="button" width="88px" height="32px" className="rounded-full" />
        <Skeleton variant="text" width="72px" />
      </div>

      {/* Title */}
      <div className="mb-2">
        <Skeleton variant="heading" width="68%" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton variant="text" lines={3} />
      </div>

      {/* Modules */}
      <div className="mb-4 flex items-center gap-2">
        <Skeleton variant="text" width="112px" />
      </div>

      {/* Progress Bar placeholder */}
      <div className="mb-5 space-y-2">
        <Skeleton variant="text" width="96px" />
        <Skeleton variant="button" width="100%" height="8px" className="rounded-full" />
      </div>

      {/* Button placeholder */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton variant="button" width="136px" height="46px" />
      </div>
    </div>
  );
}
