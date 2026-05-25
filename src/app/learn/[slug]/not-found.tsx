import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LessonNotFound() {
  return (
    <main className="py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <div className="card text-center">
          <h1 className="mb-3 text-headline-lg text-primary">Lesson not found</h1>
          <p className="mb-6 text-body-md text-on-surface-variant">
            The lesson you are looking for is not available right now.
          </p>
          <Link href="/learn" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to library
          </Link>
        </div>
      </div>
    </main>
  );
}
