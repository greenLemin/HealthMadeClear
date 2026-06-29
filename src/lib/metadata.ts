import { getSiteUrl } from "@/lib/site";

/** Per-page canonical + hreflang alternates for localized routes. */
export function localeAlternates(locale: string, path: string) {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `${base}/${locale}${normalized}`,
    languages: {
      en: `${base}/en${normalized}`,
      es: `${base}/es${normalized}`,
      "x-default": `${base}/en${normalized}`,
    },
  };
}
