import Skeleton from "@/components/ui/Skeleton";

export default function TermsLoading() {
  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width="min(100%, 14rem)" className="mb-4" />
        <Skeleton variant="text" width="min(100%, 24rem)" className="mb-8" />
        <Skeleton variant="card" height="480px" className="max-w-3xl" />
      </div>
    </div>
  );
}
