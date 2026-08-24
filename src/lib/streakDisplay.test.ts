import { describe, expect, it } from "vitest";
import { formatUtcDay, isValidIsoDay, utcDay, utcToday } from "./streakDisplay";

describe("isValidIsoDay", () => {
  it("accepts valid calendar days", () => {
    expect(isValidIsoDay("2026-08-24")).toBe(true);
    expect(isValidIsoDay("2024-02-29")).toBe(true);
  });

  it("rejects malformed or impossible days", () => {
    expect(isValidIsoDay("2026-13-01")).toBe(false);
    expect(isValidIsoDay("2026-02-30")).toBe(false);
    expect(isValidIsoDay("")).toBe(false);
    expect(isValidIsoDay("not-a-date")).toBe(false);
    expect(isValidIsoDay(null)).toBe(false);
    expect(isValidIsoDay(42)).toBe(false);
  });
});

describe("formatUtcDay", () => {
  it("formats in English by default month length", () => {
    expect(formatUtcDay("2026-08-24", "en")).toBe("Aug 24");
  });

  it("formats in Spanish", () => {
    expect(formatUtcDay("2026-08-24", "es")).toMatch(/24/);
    expect(formatUtcDay("2026-08-24", "es")).toMatch(/ago/i);
  });

  it("supports long month and weekday", () => {
    const long = formatUtcDay("2026-08-24", "en", { month: "long" });
    expect(long).toContain("August");
    const weekday = formatUtcDay("2026-08-24", "en", { weekday: true });
    expect(weekday).toContain("Mon");
  });

  it("never shifts across timezones (UTC pinned)", () => {
    // 2026-01-01T00:00Z is Dec 31 in the Americas; label must stay Jan 1.
    const label = formatUtcDay("2026-01-01", "en", { month: "long" });
    expect(label).toContain("January");
    expect(label).toContain("1");
    expect(label).not.toContain("December");
  });

  it("returns input unchanged when invalid", () => {
    expect(formatUtcDay("nope", "en")).toBe("nope");
  });
});

describe("utc day helpers", () => {
  it("utcToday returns YYYY-MM-DD", () => {
    expect(utcToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("utcDay(-1) is yesterday in UTC terms", () => {
    const today = utcToday();
    const yesterday = utcDay(-1);
    const expected = new Date(`${today}T00:00:00Z`);
    expected.setUTCDate(expected.getUTCDate() - 1);
    expect(yesterday).toBe(expected.toISOString().slice(0, 10));
  });
});
