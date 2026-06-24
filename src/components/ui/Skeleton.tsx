type SkeletonVariant = "text" | "heading" | "avatar" | "card" | "button";

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
  loadingLabel?: string;
}

const variantDefaults: Record<SkeletonVariant, { width: string; height: string; rounded: string }> = {
  text: { width: "100%", height: "1em", rounded: "rounded" },
  heading: { width: "75%", height: "1.5em", rounded: "rounded" },
  avatar: { width: "48px", height: "48px", rounded: "rounded-full" },
  card: { width: "100%", height: "200px", rounded: "rounded-2xl" },
  button: { width: "120px", height: "56px", rounded: "rounded-lg" },
};

export default function Skeleton({
  variant = "text",
  width,
  height,
  lines = 3,
  className = "",
  loadingLabel,
}: SkeletonProps) {
  const defaults = variantDefaults[variant];

  const status = loadingLabel ? (
    <span role="status" aria-live="polite" className="sr-only">
      {loadingLabel}
    </span>
  ) : null;

  if (variant === "text" && lines > 1) {
    return (
      <div className={className} aria-hidden={loadingLabel ? undefined : "true"}>
        {status}
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="mb-2 animate-pulse rounded bg-surface-container-high motion-reduce:animate-none"
            style={{
              width: i === lines - 1 ? "60%" : "100%",
              height: defaults.height,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {status}
      <div
        aria-hidden="true"
        className={[
          "animate-pulse bg-surface-container-high motion-reduce:animate-none",
          defaults.rounded,
          className,
        ].join(" ")}
        style={{
          width: width || defaults.width,
          height: height || defaults.height,
        }}
      />
    </>
  );
}

export type { SkeletonVariant, SkeletonProps };
