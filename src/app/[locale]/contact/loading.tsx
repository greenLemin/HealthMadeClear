import Skeleton from "@/components/ui/Skeleton";

export default function ContactLoading() {
  return (
    <div className="py-10 md:py-14">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <Skeleton variant="heading" width="min(100%, 16rem)" className="mx-auto mb-4" />
        <Skeleton variant="text" width="min(100%, 28rem)" className="mx-auto mb-8" />
        <Skeleton variant="card" height="420px" className="mx-auto max-w-2xl" />
      </div>
    </div>
  );
}
