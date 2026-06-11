import { cookies, headers } from "next/headers";
import Link from "next/link";

const COPY = {
  en: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has been moved.",
    home: "Go home",
    locale: "en",
  },
  es: {
    title: "Página no encontrada",
    body: "La página que buscas no existe o se movió.",
    home: "Ir al inicio",
    locale: "es",
  },
} as const;

function resolveLocale(): keyof typeof COPY {
  const cookieStore = cookies();
  const fromCookie = cookieStore.get("hmc-locale")?.value;
  if (fromCookie === "es") return "es";
  const pathname = headers().get("x-pathname") ?? headers().get("x-invoke-path") ?? "";
  if (pathname.startsWith("/es")) return "es";
  return "en";
}

export default function RootNotFound() {
  const locale = resolveLocale();
  const t = COPY[locale];

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-[var(--color-surface)] font-hyperlegible">
        <main className="py-16">
          <div className="mx-auto max-w-container px-4 md:px-6">
            <div className="card max-w-xl">
              <h1 className="mb-3 text-headline-lg text-primary">{t.title}</h1>
              <p className="mb-6 text-body-md text-on-surface-variant">{t.body}</p>
              <Link href={`/${t.locale}`} className="btn-primary inline-flex items-center justify-center">
                {t.home}
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
