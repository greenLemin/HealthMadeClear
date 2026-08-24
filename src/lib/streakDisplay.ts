const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type FormatUtcDayOptions = {
  month?: "short" | "long";
  weekday?: boolean;
};

/** True when value looks like a real calendar day in YYYY-MM-DD form. */
export function isValidIsoDay(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DAY_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed.toISOString().slice(0, 10) === `${value}T00:00:00Z`.slice(0, 10);
}

/**
 * Formats a YYYY-MM-DD string as a UTC calendar day label.
 * timeZone is pinned to UTC so the host timezone can never shift the label.
 */
export function formatUtcDay(isoDay: string, locale: string, opts?: FormatUtcDayOptions): string {
  if (!isValidIsoDay(isoDay)) return isoDay;
  const date = new Date(`${isoDay}T00:00:00Z`);
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: opts?.month ?? "short",
    ...(opts?.weekday ? { weekday: "long" } : {}),
  }).format(date);
}

/** Current UTC day as YYYY-MM-DD. */
export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

/** UTC day `offsetDays` from today as YYYY-MM-DD (negative = past). */
export function utcDay(offsetDays: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
