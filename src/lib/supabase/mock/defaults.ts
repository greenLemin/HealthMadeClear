import type { MockAccount, MockAuthState, MockDb, MockProfileRow } from "./types";
import { DEFAULT_ACCOUNT_ID, createTimestamp } from "./utils";

export function cloneDefaultAccount(): MockAccount {
  return {
    id: DEFAULT_ACCOUNT_ID,
    email: "guest@example.com",
    password:
      process.env.NEXT_PUBLIC_MOCK_GUEST_PASSWORD ||
      process.env.MOCK_GUEST_PASSWORD ||
      process.env.MOCK_USER_PASSWORD ||
      crypto.randomUUID(),
    display_name: "Guest Student",
    confirmed: true,
    pending_reset_code: null,
    pending_confirm_code: null,
    created_at: createTimestamp(),
  };
}

export function createProfileFromAccount(account: MockAccount): MockProfileRow {
  return {
    id: account.id,
    display_name: account.display_name,
    avatar_url: null,
    created_at: account.created_at,
    updated_at: account.created_at,
  };
}

export function cloneDefaultAuth(): MockAuthState {
  return {
    account: cloneDefaultAccount(),
    current_user_id: null,
  };
}

export function cloneDefaultDb(): MockDb {
  const auth = cloneDefaultAuth();
  return {
    lesson_progress: [],
    quiz_attempts: [],
    achievements: [],
    streaks: [],
    profiles: [createProfileFromAccount(auth.account)],
    daily_log: [],
    notifications: [],
    contact_submissions: [],
    auth,
  };
}
