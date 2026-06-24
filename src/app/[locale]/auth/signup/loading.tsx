import Skeleton from "@/components/ui/Skeleton";

export default function SignupLoading() {
  return (
    <div className="mx-auto max-w-container px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton variant="card" height="420px" />
      </div>
    </div>
  );
}
