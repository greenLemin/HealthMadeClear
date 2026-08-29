import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { CookieStore } from "./types";
import {
  MOCK_CONFIRM_CODE,
  MOCK_RESET_CODE,
  createMockAuthError,
  createMockUserId,
  createTimestamp,
} from "./utils";
import { createProfileFromAccount } from "./defaults";
import { syncProfileFromAccount } from "./normalizers";
import { buildMockSession, buildMockUser, getAuthenticatedAccount, getMockDb, saveMockDb } from "./store";

export const authSubscribers = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

export function emitAuthStateChange(event: AuthChangeEvent, session: Session | null) {
  authSubscribers.forEach((callback) => {
    try {
      callback(event, session);
    } catch {}
  });
}

export function createMockAuth(cookieStore?: CookieStore) {
  async function consumeAuthCode(code?: string) {
    const db = getMockDb(cookieStore);
    const account = db.auth.account;
    const validCodes = [
      account.pending_reset_code,
      account.pending_confirm_code,
      MOCK_RESET_CODE,
      MOCK_CONFIRM_CODE,
    ].filter((value): value is string => typeof value === "string" && value.length > 0);

    if (!code || !validCodes.includes(code)) {
      return {
        data: { session: null, user: null },
        error: createMockAuthError("Invalid or expired code"),
      };
    }

    account.confirmed = true;
    if (code === account.pending_reset_code || code === MOCK_RESET_CODE) {
      account.pending_reset_code = null;
    }
    if (code === account.pending_confirm_code || code === MOCK_CONFIRM_CODE) {
      account.pending_confirm_code = null;
    }

    db.auth.current_user_id = account.id;
    syncProfileFromAccount(db, account);
    saveMockDb(db, cookieStore);

    const session = buildMockSession(account);
    emitAuthStateChange("SIGNED_IN", session as unknown as Session);
    return { data: { session, user: session.user }, error: null };
  }

  return {
    async getUser() {
      const db = getMockDb(cookieStore);
      const account = getAuthenticatedAccount(db);
      return {
        data: {
          user: account ? buildMockUser(account) : null,
        },
        error: null,
      };
    },
    async getSession() {
      const db = getMockDb(cookieStore);
      const account = getAuthenticatedAccount(db);
      return {
        data: {
          session: account ? (buildMockSession(account) as unknown as Session) : null,
        },
        error: null,
      };
    },
    onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
      authSubscribers.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => authSubscribers.delete(callback),
          },
        },
      };
    },
    async signInWithPassword(credentials?: { email?: string; password?: string }) {
      const db = getMockDb(cookieStore);
      const account = db.auth.account;
      const email = credentials?.email?.trim().toLowerCase() ?? "";
      const password = credentials?.password ?? "";

      if (email !== account.email.toLowerCase() || password !== account.password) {
        return {
          data: { user: null, session: null },
          error: createMockAuthError("Invalid login credentials"),
        };
      }

      db.auth.current_user_id = account.id;
      syncProfileFromAccount(db, account);
      saveMockDb(db, cookieStore);

      const session = buildMockSession(account);
      emitAuthStateChange("SIGNED_IN", session as unknown as Session);
      return { data: { user: session.user, session }, error: null };
    },
    async signUp(input?: {
      email?: string;
      password?: string;
      options?: { data?: { display_name?: string } };
    }) {
      const db = getMockDb(cookieStore);
      const email = input?.email?.trim().toLowerCase() ?? "";
      const password = input?.password ?? "";

      if (!email || !password) {
        return {
          data: { user: null, session: null },
          error: createMockAuthError("Email and password are required"),
        };
      }

      if (email === db.auth.account.email.toLowerCase()) {
        return {
          data: { user: null, session: null },
          error: createMockAuthError("User already registered"),
        };
      }

      const displayName =
        input?.options?.data?.display_name?.trim() || email.split("@")[0] || "Guest Student";

      db.auth.account = {
        id: createMockUserId(email),
        email,
        password,
        display_name: displayName,
        confirmed: true,
        pending_reset_code: null,
        pending_confirm_code: MOCK_CONFIRM_CODE,
        created_at: createTimestamp(),
      };
      db.auth.current_user_id = null;
      db.lesson_progress = [];
      db.quiz_attempts = [];
      db.achievements = [];
      db.streaks = [];
      db.daily_log = [];
      db.notifications = [];
      db.profiles = [createProfileFromAccount(db.auth.account)];
      saveMockDb(db, cookieStore);

      return {
        data: {
          user: buildMockUser(db.auth.account),
          session: null,
        },
        error: null,
      };
    },
    async resetPasswordForEmail(email?: string) {
      const db = getMockDb(cookieStore);
      if (email?.trim().toLowerCase() === db.auth.account.email.toLowerCase()) {
        db.auth.account.pending_reset_code = MOCK_RESET_CODE;
        saveMockDb(db, cookieStore);
      }
      return { data: {}, error: null };
    },
    async exchangeCodeForSession(code?: string) {
      return consumeAuthCode(code);
    },
    async verifyOtp(params?: { token_hash?: string; type?: string; token?: string }) {
      return consumeAuthCode(params?.token_hash ?? params?.token);
    },
    async updateUser(updates?: { password?: string; data?: { display_name?: string } }) {
      const db = getMockDb(cookieStore);
      const account = getAuthenticatedAccount(db);

      if (!account) {
        return { data: { user: null }, error: createMockAuthError("Not authenticated") };
      }

      if (typeof updates?.password === "string" && updates.password.length > 0) {
        account.password = updates.password;
      }
      if (typeof updates?.data?.display_name === "string" && updates.data.display_name.trim()) {
        account.display_name = updates.data.display_name.trim();
      }

      syncProfileFromAccount(db, account);
      saveMockDb(db, cookieStore);

      const session = buildMockSession(account);
      emitAuthStateChange("USER_UPDATED", session as unknown as Session);
      return { data: { user: session.user }, error: null };
    },
    async signOut() {
      const db = getMockDb(cookieStore);
      db.auth.current_user_id = null;
      saveMockDb(db, cookieStore);
      emitAuthStateChange("SIGNED_OUT", null);
      return { error: null };
    },
  };
}
