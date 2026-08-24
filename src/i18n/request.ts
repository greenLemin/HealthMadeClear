import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  if (requested && !hasLocale(routing.locales, requested)) {
    notFound();
  }
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
