import Link from "next/link";
import { getButtonClasses } from "@/components/ui/buttonStyles";
import Card from "@/components/ui/Card";

// Static by design: this boundary is part of every route's shell, so dynamic
// APIs here (cookies/headers) would force the entire app to server-render.
// Locale-aware 404s live in src/app/[locale]/not-found.tsx; this root page
// handles paths outside any locale segment and offers both locales.
export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-surface)] font-hyperlegible">
        <main className="py-16">
          <div className="mx-auto max-w-container px-4 md:px-6">
            <Card className="max-w-xl">
              <h1 className="mb-3 text-headline-lg text-primary">Page not found</h1>
              <p className="mb-2 text-body-md text-on-surface-variant">
                The page you are looking for does not exist or has been moved.
              </p>
              <p className="mb-6 text-body-md text-on-surface-variant">
                La página que buscas no existe o se movió.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/en"
                  className={getButtonClasses({ className: "inline-flex items-center justify-center" })}
                >
                  Go home
                </Link>
                <Link
                  href="/es"
                  className={getButtonClasses({
                    variant: "secondary",
                    className: "inline-flex items-center justify-center",
                  })}
                >
                  Ir al inicio
                </Link>
              </div>
            </Card>
          </div>
        </main>
      </body>
    </html>
  );
}
