import Skeleton from "@/components/ui/Skeleton";

export default function ResetPasswordLoading() {
  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-md space-y-4">
        <Skeleton variant="heading" width="240px" className="mx-auto" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="card" height="280px" />
      </div>
    </div>
  );
}
