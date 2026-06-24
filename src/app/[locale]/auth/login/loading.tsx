import Skeleton from "@/components/ui/Skeleton";

export default function LoginLoading() {
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
