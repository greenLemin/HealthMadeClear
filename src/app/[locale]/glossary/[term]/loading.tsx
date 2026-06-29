import Skeleton from "@/components/ui/Skeleton";

export default function GlossaryTermLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="text" width="min(100%, 10rem)" className="mb-6" />
        <Skeleton variant="heading" width="min(100%, 18rem)" className="mb-4" />
        <Skeleton variant="text" lines={4} className="max-w-2xl" />
      </div>
    </div>
  );
}
