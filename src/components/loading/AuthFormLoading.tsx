import Skeleton from "@/components/ui/Skeleton";

type AuthFormLoadingVariant = "split" | "narrow" | "compact";

type AuthFormLoadingProps = {
  variant?: AuthFormLoadingVariant;
  cardHeight?: string;
};

export default function AuthFormLoading({ variant = "narrow", cardHeight = "280px" }: AuthFormLoadingProps) {
  if (variant === "split") {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center space-y-4">
            <Skeleton variant="heading" width="280px" />
            <Skeleton variant="text" width="340px" />
            <div className="mt-8 rounded-2xl bg-surface-container p-6">
              <Skeleton variant="text" lines={3} />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton variant="card" height="320px" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton variant="card" height={cardHeight} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton variant="heading" width="240px" className="mx-auto" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="card" height={cardHeight} />
      </div>
    </div>
  );
}
