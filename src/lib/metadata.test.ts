import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { localeAlternates } from "./metadata";

describe("localeAlternates", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllEnvs();
  });

  it("handles path with leading slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

    const result = localeAlternates("fr", "/about");

    expect(result).toEqual({
      canonical: "https://example.com/fr/about",
      languages: {
        en: "https://example.com/en/about",
        es: "https://example.com/es/about",
        "x-default": "https://example.com/en/about",
      },
    });
  });

  it("handles path without leading slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

    const result = localeAlternates("es", "contact");

    expect(result).toEqual({
      canonical: "https://example.com/es/contact",
      languages: {
        en: "https://example.com/en/contact",
        es: "https://example.com/es/contact",
        "x-default": "https://example.com/en/contact",
      },
    });
  });

  it("uses default localhost URL if NEXT_PUBLIC_SITE_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const result = localeAlternates("en", "/home");

    expect(result).toEqual({
      canonical: "http://localhost:3000/en/home",
      languages: {
        en: "http://localhost:3000/en/home",
        es: "http://localhost:3000/es/home",
        "x-default": "http://localhost:3000/en/home",
      },
    });
  });
});
