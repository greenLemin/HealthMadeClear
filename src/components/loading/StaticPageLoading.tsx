import Skeleton from "@/components/ui/Skeleton";

type StaticPageLoadingProps = {
  centered?: boolean;
  headingWidth?: string;
  descriptionWidth?: string;
  primaryCardHeight?: string;
  primaryCardClassName?: string;
  grid?: {
    heroHeight: string;
    count: number;
    itemHeight: string;
  };
};

export default function StaticPageLoading({
  centered = false,
  headingWidth = "min(100%, 14rem)",
  descriptionWidth = "min(100%, 28rem)",
  primaryCardHeight = "400px",
  primaryCardClassName = "max-w-3xl",
  grid,
}: StaticPageLoadingProps) {
  const headingClass = centered ? "mx-auto mb-4" : "mb-4";
  const descriptionClass = centered ? "mx-auto mb-8" : "mb-8";

  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width={headingWidth} className={headingClass} />
        <Skeleton variant="text" width={descriptionWidth} className={descriptionClass} />

        {grid ? (
          <>
            <Skeleton variant="card" height={grid.heroHeight} className="mx-auto mb-8 max-w-3xl" />
            <div className="grid gap-6 md:grid-cols-3">
              {Array.from({ length: grid.count }, (_, index) => (
                <Skeleton key={index} variant="card" height={grid.itemHeight} />
              ))}
            </div>
          </>
        ) : (
          <Skeleton
            variant="card"
            height={primaryCardHeight}
            className={centered ? `mx-auto ${primaryCardClassName}` : primaryCardClassName}
          />
        )}
      </div>
    </div>
  );
}
