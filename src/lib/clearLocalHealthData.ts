import { STORAGE_KEYS } from "./preferences";

export const PRESERVED_STORAGE_KEYS = new Set<string>([
  STORAGE_KEYS.locale,
  STORAGE_KEYS.theme,
  STORAGE_KEYS.textSize,
  STORAGE_KEYS.simpleMode,
  "hmc_locale",
  "hmc_theme",
  "hmc_text_size",
  "hmc_simple_mode",
]);

export const DEFAULT_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 0,
};

function clearStorageKeys(storage: Storage | null | undefined): void {
  if (!storage) return;
  try {
    const keysToDelete: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && /^hmc[-_]/.test(key) && !PRESERVED_STORAGE_KEYS.has(key)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => {
      try {
        storage.removeItem(key);
      } catch {}
    });
  } catch {}
}

/**
 * Scans both localStorage and sessionStorage, collecting keys first before deleting,
 * removing all health-data and guest keys matching `/^hmc[-_]/` while strictly
 * preserving user preferences (locale, theme, text size, simple mode).
 */
export function clearLocalHealthData(): void {
  if (typeof window === "undefined") return;
  try {
    clearStorageKeys(window.localStorage);
  } catch {}
  try {
    clearStorageKeys(window.sessionStorage);
  } catch {}
}

/**
 * Expires client-side auth cookies (`sb-*-auth-token*`) and Google Analytics
 * cookies (`_ga`, `_gid`, `_ga_*`) by setting Max-Age=0 with path=/ and SameSite=Lax.
 * Note: An expiration with `path=/` cannot remove a hypothetically mis-pathed cookie
 * set at a narrower subpath.
 * Preference cookies (`hmc-theme`, `hmc-locale`, etc.) are preserved.
 */
export function expireClientAuthCookies(): void {
  if (typeof document === "undefined") return;
  const raw = document.cookie;
  if (!raw) return;

  const cookies = raw.split(";");
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const secure = isHttps ? "; Secure" : "";

  for (const cookie of cookies) {
    const name = cookie.split("=")[0]?.trim();
    if (!name) continue;

    if (/^sb-.*-auth-token/.test(name) || name === "_ga" || name === "_gid" || /^_ga_/.test(name)) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${secure}`;
    }
  }
}
