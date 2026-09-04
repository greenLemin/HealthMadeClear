import type { CookieStore, MockAccount, MockDb } from "./types";
import { parseFirstJsonObject } from "./utils";
import { cloneDefaultDb } from "./defaults";
import { normalizeMockDb } from "./normalizers";

export function decodeMockCookieValue(raw: string): string {
  // request.cookies.get() returns the raw cookie value which saveMockDb stores
  // as encodeURIComponent(JSON). Decode the full value — never split on ","
  // (encoded commas are %2C, and a raw JSON payload legitimately contains commas;
  // truncating to the first comma yields invalid JSON and drops auth state).
  if (raw.startsWith("%7B") || raw.includes("%")) {
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

export function getMockDb(cookieStore?: Pick<CookieStore, "get">): MockDb {
  let json: string | null = null;

  try {
    if (cookieStore) {
      const raw = cookieStore.get("hmc_mock_db")?.value || null;
      if (raw) {
        json = decodeMockCookieValue(raw);
      }
    } else if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )hmc_mock_db=([^;]*)/);
      if (match) {
        const raw = match[1]!;
        json = raw.startsWith("%7B") || raw.includes("%") ? decodeURIComponent(raw) : raw;
      }
    }
  } catch {
    json = null;
  }

  if (!json) return cloneDefaultDb();

  try {
    return normalizeMockDb(parseFirstJsonObject<MockDb>(json));
  } catch {
    return cloneDefaultDb();
  }
}

export function saveMockDb(db: MockDb, cookieStore?: CookieStore) {
  const encoded = encodeURIComponent(JSON.stringify(db));

  if (cookieStore && "set" in cookieStore && typeof cookieStore.set === "function") {
    cookieStore.set("hmc_mock_db", encoded, { path: "/" });
  } else if (typeof document !== "undefined") {
    document.cookie = `hmc_mock_db=${encoded};path=/;max-age=31536000;SameSite=Lax`;
  }
}

export function getAuthenticatedAccount(db: MockDb): MockAccount | null {
  return db.auth.current_user_id === db.auth.account.id ? db.auth.account : null;
}

export function getFallbackUserId(db: MockDb) {
  return db.auth.current_user_id ?? db.auth.account.id;
}

export function buildMockUser(account: MockAccount) {
  return {
    id: account.id,
    email: account.email,
    user_metadata: { display_name: account.display_name },
    aud: "authenticated",
    role: "authenticated",
  };
}

export function buildMockSession(account: MockAccount) {
  return {
    access_token: `mock-access-token-${account.id}`,
    refresh_token: `mock-refresh-token-${account.id}`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: buildMockUser(account),
  };
}
