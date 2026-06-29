import Skeleton from "@/components/ui/Skeleton";

export default function GlossaryLoading() {
  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-container px-4 md:px-6">
        <div className="space-y-8">
          <section className="section-frame px-6 py-8 md:px-8 md:py-10">
            <Skeleton variant="text" width="120px" className="mb-4" />
            <Skeleton variant="heading" width="260px" className="max-w-full" />
            <Skeleton variant="text" width="60%" className="mt-4 max-w-xl" />
          </section>

          <section className="surface-card-glass max-w-3xl px-5 py-5 md:px-6 md:py-6">
            <Skeleton variant="button" width="100%" height="56px" className="rounded-[1rem]" />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="surface-card px-6 py-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Skeleton variant="text" width="84px" />
                  <Skeleton variant="button" width="70px" height="32px" className="rounded-full" />
                </div>
                <Skeleton variant="heading" width="72%" className="max-w-full" />
                <Skeleton variant="text" lines={3} className="mt-4" />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
