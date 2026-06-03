import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n";

export function parseLocale(value: string): Locale | null {
  return routing.locales.includes(value as Locale) ? (value as Locale) : null;
}

export function requireLocale(value: string): Locale {
  const locale = parseLocale(value);
  if (!locale) {
    throw new Error(`Invalid locale: ${value}`);
  }
  return locale;
}
