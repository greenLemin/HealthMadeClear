// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearLocalHealthData,
  expireClientAuthCookies,
  PRESERVED_STORAGE_KEYS,
  DEFAULT_COOKIE_OPTIONS,
} from "./clearLocalHealthData";
import { STORAGE_KEYS } from "./preferences";

const ONBOARDING_KEY = "hmc_onboarded";
const BANNER_DISMISSED_KEY = "hmc_save_progress_dismissed";
const STORAGE_PREFIX = "hmc_guest_";

describe("clearLocalHealthData", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (name) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("wipes health keys and guest keys from both localStorage and sessionStorage while preserving preferences", () => {
    const healthKeys = [
      "hmc-completed-lessons",
      "hmc-quiz-scores",
      "hmc-visit-planner",
      "hmc-visit-planner-v2",
      "hmc-glossary-lookups",
      "hmc_guest_completedLessons",
      "hmc_guest_quizAttempts",
      "hmc_onboarded",
      "hmc_save_progress_dismissed",
      "hmc-future-tool",
    ];

    healthKeys.forEach((key) => {
      localStorage.setItem(key, "data");
      sessionStorage.setItem(key, "data");
    });

    // Preferences to preserve
    localStorage.setItem(STORAGE_KEYS.locale, "es");
    localStorage.setItem(STORAGE_KEYS.theme, "dark");
    localStorage.setItem(STORAGE_KEYS.textSize, "large");
    localStorage.setItem(STORAGE_KEYS.simpleMode, "true");
    localStorage.setItem("hmc_locale", "es");
    localStorage.setItem("hmc_theme", "dark");
    localStorage.setItem("hmc_text_size", "large");
    localStorage.setItem("hmc_simple_mode", "true");

    sessionStorage.setItem(STORAGE_KEYS.locale, "es");
    sessionStorage.setItem(STORAGE_KEYS.theme, "dark");

    clearLocalHealthData();

    // Check health keys deleted
    healthKeys.forEach((key) => {
      expect(localStorage.getItem(key)).toBeNull();
      expect(sessionStorage.getItem(key)).toBeNull();
    });

    // Check preferences preserved
    expect(localStorage.getItem(STORAGE_KEYS.locale)).toBe("es");
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");
    expect(localStorage.getItem(STORAGE_KEYS.textSize)).toBe("large");
    expect(localStorage.getItem(STORAGE_KEYS.simpleMode)).toBe("true");
    expect(localStorage.getItem("hmc_locale")).toBe("es");
    expect(localStorage.getItem("hmc_theme")).toBe("dark");
    expect(localStorage.getItem("hmc_text_size")).toBe("large");
    expect(localStorage.getItem("hmc_simple_mode")).toBe("true");

    expect(sessionStorage.getItem(STORAGE_KEYS.locale)).toBe("es");
    expect(sessionStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");
  });

  it("safely collects keys before deletion without skipping keys due to live length mutation", () => {
    for (let i = 0; i < 50; i++) {
      localStorage.setItem(`hmc-test-health-key-${i}`, `val-${i}`);
    }
    localStorage.setItem(STORAGE_KEYS.theme, "light");

    clearLocalHealthData();

    for (let i = 0; i < 50; i++) {
      expect(localStorage.getItem(`hmc-test-health-key-${i}`)).toBeNull();
    }
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("light");
  });

  it("verifies prefix conventions on STORAGE_KEYS and other constants (CF-49)", () => {
    // Every STORAGE_KEYS value matches /^hmc[-_]/ or is in PRESERVED_STORAGE_KEYS
    const allStorageKeysValid = Object.values(STORAGE_KEYS).every(
      (k) => /^hmc[-_]/.test(k) || PRESERVED_STORAGE_KEYS.has(k)
    );
    expect(allStorageKeysValid).toBe(true);

    // Assert ONBOARDING_KEY, BANNER_DISMISSED_KEY, STORAGE_PREFIX match prefix
    expect(/^hmc[-_]/.test(ONBOARDING_KEY)).toBe(true);
    expect(/^hmc[-_]/.test(BANNER_DISMISSED_KEY)).toBe(true);
    expect(/^hmc[-_]/.test(STORAGE_PREFIX)).toBe(true);
  });

  it("expires client auth cookies and GA measurement cookies while preserving preferences", () => {
    document.cookie = "sb-projectref-auth-token=jwt-token; path=/";
    document.cookie = "sb-projectref-auth-token.0=jwt-chunk-0; path=/";
    document.cookie = "_ga=GA1.2.123456789.1234567890; path=/";
    document.cookie = "_gid=GA1.2.987654321.0987654321; path=/";
    document.cookie = "_ga_ABCDEF1234=GS1.1.123456.1.0.0; path=/";
    document.cookie = "hmc-theme=dark; path=/";

    expireClientAuthCookies();

    const cookies = document.cookie;
    expect(cookies).not.toContain("sb-projectref-auth-token=");
    expect(cookies).not.toContain("sb-projectref-auth-token.0=");
    expect(cookies).not.toContain("_ga=");
    expect(cookies).not.toContain("_gid=");
    expect(cookies).not.toContain("_ga_ABCDEF1234=");
    expect(cookies).toContain("hmc-theme=dark");
  });

  it("verifies DEFAULT_COOKIE_OPTIONS has path='/' and documents mis-pathed limitation", () => {
    expect(DEFAULT_COOKIE_OPTIONS.path).toBe("/");
    // Document: Expiring with path=/ will clear standard root-scoped cookies,
    // but cannot remove hypothetically mis-pathed cookies set at subpaths like path=/en.
  });
});
