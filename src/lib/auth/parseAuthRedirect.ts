import type { Locale } from "@/lib/i18n";

export const OTP_TYPES = ["signup", "email", "invite", "magiclink", "recovery", "email_change"] as const;

export type OtpType = (typeof OTP_TYPES)[number];

export function isOtpType(value: string | null | undefined): value is OtpType {
  return typeof value === "string" && (OTP_TYPES as readonly string[]).includes(value);
}

/** First path segment if it is a locale; otherwise `"en"`. */
export function getLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return first === "en" || first === "es" ? first : "en";
}

export function loginErrorUrl(origin: string, locale: Locale, errorCode: string): string {
  return `${origin}/${locale}/auth/login?error=${errorCode}`;
}

export function recoveryRedirect(locale: Locale): string {
  return `/${locale}/auth/reset-password`;
}
