import Skeleton from "@/components/ui/Skeleton";

export default function LearnLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="space-y-8">
          <section className="section-frame px-6 py-8 md:px-8 md:py-10">
            <Skeleton variant="text" width="140px" className="mb-4" />
            <Skeleton variant="heading" width="300px" className="max-w-full" />
            <Skeleton variant="text" width="72%" className="mt-4 max-w-2xl" />
          </section>

          <section className="surface-card-glass px-5 py-5 md:px-6 md:py-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <Skeleton variant="button" width="100%" height="56px" className="rounded-[1rem]" />
              <Skeleton variant="button" width="132px" height="56px" className="rounded-full" />
              <Skeleton variant="button" width="132px" height="56px" className="rounded-full" />
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="surface-card px-6 py-6 md:px-8 md:py-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Skeleton variant="avatar" width="32px" height="32px" />
                  <Skeleton variant="button" width="86px" height="32px" className="rounded-full" />
                  <Skeleton variant="text" width="70px" />
                </div>
                <Skeleton variant="heading" width="64%" className="max-w-full" />
                <Skeleton variant="text" lines={3} className="mt-4" />
                <div className="mt-6 flex flex-wrap gap-3">
                  <Skeleton variant="button" width="108px" height="36px" className="rounded-full" />
                  <Skeleton variant="button" width="116px" height="36px" className="rounded-full" />
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
