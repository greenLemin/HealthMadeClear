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
  const shimmerClass =
    "relative overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(229,221,211,0.9),rgba(255,255,255,0.9))] before:absolute before:inset-y-0 before:left-[-40%] before:w-[40%] before:animate-shimmer before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.78),transparent)] before:content-[''] dark:bg-[linear-gradient(135deg,rgba(29,43,47,0.96),rgba(36,52,56,0.94),rgba(29,43,47,0.96))] dark:before:bg-[linear-gradient(90deg,transparent,rgba(152,221,218,0.18),transparent)] motion-reduce:before:hidden";

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
            className={[
              "mb-2 animate-pulse rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] motion-reduce:animate-none",
              shimmerClass,
            ].join(" ")}
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
          "animate-pulse shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] motion-reduce:animate-none",
          shimmerClass,
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
