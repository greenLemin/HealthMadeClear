import Skeleton from "@/components/ui/Skeleton";

interface PageHeaderSkeletonProps {
  eyebrowWidth?: string;
  headingWidth?: string;
  descriptionWidth?: string;
  centered?: boolean;
  className?: string;
}

export default function PageHeaderSkeleton({
  eyebrowWidth = "140px",
  headingWidth = "300px",
  descriptionWidth = "72%",
  centered = false,
  className = "section-frame px-6 py-8 md:px-8 md:py-10",
}: PageHeaderSkeletonProps) {
  const align = centered ? "mx-auto" : "";
  return (
    <section className={className}>
      <Skeleton variant="text" width={eyebrowWidth} className={`mb-4 ${align}`} />
      <Skeleton variant="heading" width={headingWidth} className={`max-w-full ${align}`} />
      <Skeleton variant="text" width={descriptionWidth} className={`mt-4 max-w-2xl ${align}`} />
    </section>
  );
}
