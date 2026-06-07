import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-surface)] font-hyperlegible">
        <main className="py-16">
          <div className="mx-auto max-w-container px-4 md:px-6">
            <div className="card max-w-xl">
              <h1 className="mb-3 text-headline-lg text-primary">Page not found</h1>
              <p className="mb-6 text-body-md text-on-surface-variant">
                The page you are looking for does not exist or has been moved.
              </p>
              <Link href="/en" className="btn-primary inline-flex items-center justify-center">
                Go home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
