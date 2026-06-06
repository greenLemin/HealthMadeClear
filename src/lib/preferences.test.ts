// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { readStoredLocale, PREFERENCE_COOKIES, STORAGE_KEYS } from "./preferences";

describe("readStoredLocale", () => {
  beforeEach(() => {
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    // Clear localStorage
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 'en' by default when nothing is set", () => {
    expect(readStoredLocale()).toBe("en");
  });

  it("should return 'es' if cookie is set to 'es'", () => {
    document.cookie = `${PREFERENCE_COOKIES.locale}=es`;
    expect(readStoredLocale()).toBe("es");
  });

  it("should return 'es' if localStorage is set to 'es' and cookie is absent", () => {
    window.localStorage.setItem(STORAGE_KEYS.locale, "es");
    expect(readStoredLocale()).toBe("es");
  });

  it("should return 'en' if localStorage is 'en'", () => {
    window.localStorage.setItem(STORAGE_KEYS.locale, "en");
    expect(readStoredLocale()).toBe("en");
  });

  it("should prefer cookie over localStorage", () => {
    document.cookie = `${PREFERENCE_COOKIES.locale}=es`;
    window.localStorage.setItem(STORAGE_KEYS.locale, "en");
    expect(readStoredLocale()).toBe("es");
  });

  it("should return 'en' if cookie is invalid", () => {
    document.cookie = `${PREFERENCE_COOKIES.locale}=invalid-locale`;
    expect(readStoredLocale()).toBe("en");
  });

  it("should return 'en' if localStorage is invalid and cookie is absent", () => {
    window.localStorage.setItem(STORAGE_KEYS.locale, "invalid-locale");
    expect(readStoredLocale()).toBe("en");
  });

  it("should handle undefined document safely", () => {
    const originalDocument = global.document;
    // @ts-ignore
    delete global.document;

    expect(readStoredLocale()).toBe("en");

    global.document = originalDocument;
  });

  it("should handle undefined window safely", () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    expect(readStoredLocale()).toBe("en");

    global.window = originalWindow;
  });
});
