import type { AuthChangeEvent, Session, SupabaseClient } from "@supabase/supabase-js";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { Database } from "@/types/database";

export interface MockCookieStore {
  get(name: string): { name: string; value: string } | undefined | null;
  set?(name: string, value: string, options?: any): void;
}

export type CookieStore = ReadonlyRequestCookies | MockCookieStore;

type MockProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MockLessonProgressRow = Database["public"]["Tables"]["lesson_progress"]["Row"];
type MockQuizAttemptRow = Database["public"]["Tables"]["quiz_attempts"]["Row"];
type MockAchievementRow = Database["public"]["Tables"]["achievements"]["Row"];
type MockStreakRow = Database["public"]["Tables"]["streaks"]["Row"];
type MockDailyLogRow = Database["public"]["Tables"]["daily_log"]["Row"];
type MockNotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

type MockAccount = {
  id: string;
  email: string;
  password: string;
  display_name: string;
  confirmed: boolean;
  pending_reset_code: string | null;
  pending_confirm_code: string | null;
  created_at: string;
};

type MockAuthState = {
  account: MockAccount;
  current_user_id: string | null;
};

type MockDb = {
  lesson_progress: MockLessonProgressRow[];
  quiz_attempts: MockQuizAttemptRow[];
  achievements: MockAchievementRow[];
  streaks: MockStreakRow[];
  profiles: MockProfileRow[];
  daily_log: MockDailyLogRow[];
  notifications: MockNotificationRow[];
  auth: MockAuthState;
};

type QueryFilter =
  | { type: "eq"; column: string; value: unknown }
  | { type: "gte"; column: string; value: unknown }
  | { type: "is"; column: string; value: unknown }
  | { type: "in"; column: string; value: unknown[] }
  | { type: "not"; column: string; operator: string; value: unknown };

type QueryOrder = {
  column: string;
  ascending: boolean;
};

type QueryRange = {
  from: number;
  to: number;
};

type QueryMutation = {
  kind: "insert" | "upsert" | "update" | "delete";
  values?: unknown;
  options?: unknown;
};

const MOCK_RESET_CODE = "mock-reset";
const MOCK_CONFIRM_CODE = "mock-confirm";
const DEFAULT_ACCOUNT_ID = "00000000-0000-0000-0000-000000000000";
const DEFAULT_TIME_SPENT_SECONDS = 60;

function createTimestamp(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

function createMockId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function createMockAuthError(message: string) {
  return { message, name: "AuthApiError", status: 400 };
}

function createMockUserId(email: string) {
  const normalized =
    email
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mock-user";
  return `mock-${normalized}`;
}

function cloneDefaultAccount(): MockAccount {
  return {
    id: DEFAULT_ACCOUNT_ID,
    email: "guest@example.com",
    password: "password123",
    display_name: "Guest Student",
    confirmed: true,
    pending_reset_code: null,
    pending_confirm_code: null,
    created_at: createTimestamp(),
  };
}

function createProfileFromAccount(account: MockAccount): MockProfileRow {
  return {
    id: account.id,
    display_name: account.display_name,
    avatar_url: null,
    created_at: account.created_at,
    updated_at: account.created_at,
  };
}

function cloneDefaultAuth(): MockAuthState {
  return {
    account: cloneDefaultAccount(),
    current_user_id: null,
  };
}

function cloneDefaultDb(): MockDb {
  const auth = cloneDefaultAuth();
  return {
    lesson_progress: [],
    quiz_attempts: [],
    achievements: [],
    streaks: [],
    profiles: [createProfileFromAccount(auth.account)],
    daily_log: [],
    notifications: [],
    auth,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function normalizeMockAccount(value: unknown, fallback: MockAccount): MockAccount {
  const record = asRecord(value);
  if (!record) return { ...fallback };

  return {
    id: typeof record.id === "string" ? record.id : fallback.id,
    email: typeof record.email === "string" ? record.email : fallback.email,
    password: typeof record.password === "string" ? record.password : fallback.password,
    display_name: typeof record.display_name === "string" ? record.display_name : fallback.display_name,
    confirmed: typeof record.confirmed === "boolean" ? record.confirmed : fallback.confirmed,
    pending_reset_code: typeof record.pending_reset_code === "string" ? record.pending_reset_code : null,
    pending_confirm_code:
      typeof record.pending_confirm_code === "string" ? record.pending_confirm_code : null,
    created_at: typeof record.created_at === "string" ? record.created_at : fallback.created_at,
  };
}

function normalizeProfileRow(value: unknown, fallback: MockProfileRow): MockProfileRow | null {
  const record = asRecord(value);
  if (!record) return null;

  return {
    id: typeof record.id === "string" ? record.id : fallback.id,
    display_name:
      typeof record.display_name === "string" || record.display_name === null
        ? (record.display_name as string | null)
        : fallback.display_name,
    avatar_url:
      typeof record.avatar_url === "string" || record.avatar_url === null
        ? (record.avatar_url as string | null)
        : fallback.avatar_url,
    created_at: typeof record.created_at === "string" ? record.created_at : fallback.created_at,
    updated_at: typeof record.updated_at === "string" ? record.updated_at : fallback.updated_at,
  };
}

function normalizeLessonProgressRow(
  value: unknown,
  fallbackUserId: string,
  index: number
): MockLessonProgressRow | null {
  const record = asRecord(value);
  if (!record || typeof record.lesson_id !== "string") return null;

  const completedAt =
    typeof record.completed_at === "string" || record.completed_at === null
      ? (record.completed_at as string | null)
      : createTimestamp(index * 60000);

  return {
    id: typeof record.id === "string" ? record.id : createMockId("lesson-progress"),
    user_id: typeof record.user_id === "string" ? record.user_id : fallbackUserId,
    lesson_id: record.lesson_id,
    completed: typeof record.completed === "boolean" ? record.completed : true,
    completed_at: completedAt,
    time_spent_seconds:
      typeof record.time_spent_seconds === "number" ? record.time_spent_seconds : DEFAULT_TIME_SPENT_SECONDS,
    created_at:
      typeof record.created_at === "string"
        ? record.created_at
        : (completedAt ?? createTimestamp(index * 60000)),
    updated_at:
      typeof record.updated_at === "string"
        ? record.updated_at
        : (completedAt ?? createTimestamp(index * 60000)),
  };
}

function normalizeQuizAttemptRow(
  value: unknown,
  fallbackUserId: string,
  index: number
): MockQuizAttemptRow | null {
  const record = asRecord(value);
  if (!record || typeof record.quiz_id !== "string") return null;

  return {
    id: typeof record.id === "string" ? record.id : createMockId("quiz-attempt"),
    user_id: typeof record.user_id === "string" ? record.user_id : fallbackUserId,
    quiz_id: record.quiz_id,
    score: typeof record.score === "number" ? record.score : 0,
    max_score: typeof record.max_score === "number" ? record.max_score : 100,
    passed: typeof record.passed === "boolean" ? record.passed : false,
    answers: record.answers ?? null,
    attempted_at:
      typeof record.attempted_at === "string" ? record.attempted_at : createTimestamp(index * 60000),
  };
}

function normalizeAchievementRow(
  value: unknown,
  fallbackUserId: string,
  index: number
): MockAchievementRow | null {
  if (typeof value === "string") {
    return {
      id: createMockId("achievement"),
      user_id: fallbackUserId,
      achievement_id: value,
      earned_at: createTimestamp(index * 60000),
    };
  }

  const record = asRecord(value);
  if (!record || typeof record.achievement_id !== "string") return null;

  return {
    id: typeof record.id === "string" ? record.id : createMockId("achievement"),
    user_id: typeof record.user_id === "string" ? record.user_id : fallbackUserId,
    achievement_id: record.achievement_id,
    earned_at: typeof record.earned_at === "string" ? record.earned_at : createTimestamp(index * 60000),
  };
}

function normalizeStreakRow(value: unknown, fallbackUserId: string): MockStreakRow | null {
  const record = asRecord(value);
  if (!record) return null;

  return {
    user_id: typeof record.user_id === "string" ? record.user_id : fallbackUserId,
    current_streak: typeof record.current_streak === "number" ? record.current_streak : 0,
    longest_streak: typeof record.longest_streak === "number" ? record.longest_streak : 0,
    last_activity_date:
      typeof record.last_activity_date === "string" || record.last_activity_date === null
        ? (record.last_activity_date as string | null)
        : null,
    updated_at: typeof record.updated_at === "string" ? record.updated_at : createTimestamp(),
  };
}

function normalizeDailyLogRow(value: unknown, fallbackUserId: string, index: number): MockDailyLogRow | null {
  if (typeof value === "string") {
    return {
      id: createMockId("daily-log"),
      user_id: fallbackUserId,
      activity_date: value,
      created_at: createTimestamp(index * 60000),
    };
  }

  const record = asRecord(value);
  if (!record || typeof record.activity_date !== "string") return null;

  return {
    id: typeof record.id === "string" ? record.id : createMockId("daily-log"),
    user_id: typeof record.user_id === "string" ? record.user_id : fallbackUserId,
    activity_date: record.activity_date,
    created_at: typeof record.created_at === "string" ? record.created_at : createTimestamp(index * 60000),
  };
}

function normalizeNotificationRow(
  value: unknown,
  fallbackUserId: string,
  index: number
): MockNotificationRow | null {
  const record = asRecord(value);
  if (!record) return null;

  const title = typeof record.title === "string" ? record.title : null;
  const body = typeof record.body === "string" ? record.body : null;
  const type = typeof record.type === "string" ? record.type : null;

  if (!title || !body || !type) return null;

  return {
    id: typeof record.id === "string" ? record.id : createMockId("notification"),
    user_id: typeof record.user_id === "string" ? record.user_id : fallbackUserId,
    type,
    title,
    body,
    read: typeof record.read === "boolean" ? record.read : false,
    created_at: typeof record.created_at === "string" ? record.created_at : createTimestamp(index * 60000),
  };
}

function normalizeLegacyLessonRows(raw: unknown, fallbackUserId: string): MockLessonProgressRow[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (typeof item === "string") {
        return normalizeLessonProgressRow(
          {
            lesson_id: item,
            user_id: fallbackUserId,
            completed: true,
            completed_at: createTimestamp(index * 60000),
            time_spent_seconds: DEFAULT_TIME_SPENT_SECONDS,
          },
          fallbackUserId,
          index
        );
      }
      return normalizeLessonProgressRow(item, fallbackUserId, index);
    })
    .filter((row): row is MockLessonProgressRow => row !== null);
}

function normalizeLegacyQuizRows(raw: unknown, fallbackUserId: string): MockQuizAttemptRow[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => normalizeQuizAttemptRow(item, fallbackUserId, index))
    .filter((row): row is MockQuizAttemptRow => row !== null);
}

function normalizeMockDb(value: unknown): MockDb {
  const fallback = cloneDefaultDb();
  const record = asRecord(value);
  if (!record) return fallback;

  const fallbackAccount = cloneDefaultAccount();
  const rawProfile = asRecord(record.profile);
  if (rawProfile) {
    if (typeof rawProfile.display_name === "string") {
      fallbackAccount.display_name = rawProfile.display_name;
    }
    if (typeof rawProfile.created_at === "string") {
      fallbackAccount.created_at = rawProfile.created_at;
    }
  }

  const account = normalizeMockAccount(asRecord(record.auth)?.account, fallbackAccount);
  const currentUserId =
    typeof asRecord(record.auth)?.current_user_id === "string" &&
    asRecord(record.auth)?.current_user_id === account.id
      ? account.id
      : null;

  const profiles =
    Array.isArray(record.profiles) && record.profiles.length > 0
      ? record.profiles
          .map((item) => normalizeProfileRow(item, createProfileFromAccount(account)))
          .filter((row): row is MockProfileRow => row !== null)
      : rawProfile
        ? [normalizeProfileRow({ ...rawProfile, id: account.id }, createProfileFromAccount(account))].filter(
            (row): row is MockProfileRow => row !== null
          )
        : [];

  const db: MockDb = {
    lesson_progress: Array.isArray(record.lesson_progress)
      ? record.lesson_progress
          .map((item, index) => normalizeLessonProgressRow(item, account.id, index))
          .filter((row): row is MockLessonProgressRow => row !== null)
      : normalizeLegacyLessonRows(record.lessons, account.id),
    quiz_attempts: Array.isArray(record.quiz_attempts)
      ? record.quiz_attempts
          .map((item, index) => normalizeQuizAttemptRow(item, account.id, index))
          .filter((row): row is MockQuizAttemptRow => row !== null)
      : normalizeLegacyQuizRows(record.quizzes, account.id),
    achievements: Array.isArray(record.achievements)
      ? record.achievements
          .map((item, index) => normalizeAchievementRow(item, account.id, index))
          .filter((row): row is MockAchievementRow => row !== null)
      : [],
    streaks: Array.isArray(record.streaks)
      ? record.streaks
          .map((item) => normalizeStreakRow(item, account.id))
          .filter((row): row is MockStreakRow => row !== null)
      : record.streak
        ? [normalizeStreakRow(record.streak, account.id)].filter((row): row is MockStreakRow => row !== null)
        : [],
    profiles,
    daily_log: Array.isArray(record.daily_log)
      ? record.daily_log
          .map((item, index) => normalizeDailyLogRow(item, account.id, index))
          .filter((row): row is MockDailyLogRow => row !== null)
      : [],
    notifications: Array.isArray(record.notifications)
      ? record.notifications
          .map((item, index) => normalizeNotificationRow(item, account.id, index))
          .filter((row): row is MockNotificationRow => row !== null)
      : [],
    auth: {
      account,
      current_user_id: currentUserId,
    },
  };

  syncProfileFromAccount(db, account);
  return db;
}

function parseFirstJsonObject<T = unknown>(str: string): T {
  try {
    return JSON.parse(str) as T;
  } catch (err) {
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (char === "\\") {
        escape = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (!inString) {
        if (char === "{") depth += 1;
        if (char === "}") {
          depth -= 1;
          if (depth === 0) {
            const candidate = str.substring(0, i + 1);
            try {
              return JSON.parse(candidate) as T;
            } catch {}
          }
        }
      }
    }

    throw err;
  }
}

function getMockDb(cookieStore?: Pick<CookieStore, "get">): MockDb {
  let json: string | null = null;

  try {
    if (cookieStore) {
      const raw = cookieStore.get("hmc_mock_db")?.value || null;
      if (raw) {
        if (raw.startsWith("%7B") || raw.includes("%")) {
          json = decodeURIComponent(raw.split(",")[0]);
        } else {
          json = raw;
        }
      }
    } else if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )hmc_mock_db=([^;]*)/);
      if (match) {
        const raw = match[1];
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

function saveMockDb(db: MockDb, cookieStore?: CookieStore) {
  const encoded = encodeURIComponent(JSON.stringify(db));

  if (cookieStore && "set" in cookieStore && typeof cookieStore.set === "function") {
    cookieStore.set("hmc_mock_db", encoded, { path: "/" });
  } else if (typeof document !== "undefined") {
    document.cookie = `hmc_mock_db=${encoded};path=/;max-age=31536000;SameSite=Lax`;
  }
}

function getAuthenticatedAccount(db: MockDb): MockAccount | null {
  return db.auth.current_user_id === db.auth.account.id ? db.auth.account : null;
}

function syncProfileFromAccount(db: MockDb, account: MockAccount) {
  const existing = db.profiles.find((profile) => profile.id === account.id);
  if (existing) {
    existing.display_name = account.display_name;
    existing.created_at ||= account.created_at;
    existing.updated_at = createTimestamp();
    return;
  }

  db.profiles.push(createProfileFromAccount(account));
}

function getFallbackUserId(db: MockDb) {
  return db.auth.current_user_id ?? db.auth.account.id;
}

function buildMockUser(account: MockAccount) {
  return {
    id: account.id,
    email: account.email,
    user_metadata: { display_name: account.display_name },
    aud: "authenticated",
    role: "authenticated",
  };
}

function buildMockSession(account: MockAccount) {
  return {
    access_token: `mock-access-token-${account.id}`,
    refresh_token: `mock-refresh-token-${account.id}`,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: buildMockUser(account),
  };
}

function parseSelectedColumns(columns?: string): string[] | null {
  if (!columns || columns.trim() === "" || columns.trim() === "*") return null;
  return columns
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);
}

function projectRows(rows: Record<string, unknown>[], columns: string[] | null) {
  if (!columns) return rows.map((row) => ({ ...row }));

  return rows.map((row) => {
    const projected: Record<string, unknown> = {};
    for (const column of columns) {
      projected[column] = row[column] ?? null;
    }
    return projected;
  });
}

function matchesFilter(row: Record<string, unknown>, filter: QueryFilter) {
  const value = row[filter.column];

  switch (filter.type) {
    case "eq":
      return value === filter.value;
    case "gte":
      return (
        value !== undefined &&
        value !== null &&
        (value as string | number) >= (filter.value as string | number)
      );
    case "is":
      return value === filter.value;
    case "in":
      return Array.isArray(filter.value) ? filter.value.includes(value) : false;
    case "not":
      if (filter.operator === "is") return value !== filter.value;
      return value !== filter.value;
    default:
      return true;
  }
}

function applyFilters(rows: Record<string, unknown>[], filters: QueryFilter[]) {
  return filters.reduce(
    (currentRows, filter) => currentRows.filter((row) => matchesFilter(row, filter)),
    rows
  );
}

function applyOrdering(rows: Record<string, unknown>[], order: QueryOrder | null) {
  if (!order) return rows;

  return [...rows].sort((left, right) => {
    const leftValue = left[order.column];
    const rightValue = right[order.column];

    if (leftValue === rightValue) return 0;
    if (leftValue === undefined || leftValue === null) return order.ascending ? 1 : -1;
    if (rightValue === undefined || rightValue === null) return order.ascending ? -1 : 1;

    if (leftValue < rightValue) return order.ascending ? -1 : 1;
    return order.ascending ? 1 : -1;
  });
}

function applyRange(rows: Record<string, unknown>[], range: QueryRange | null, limit: number | null) {
  let nextRows = rows;
  if (range) {
    nextRows = nextRows.slice(range.from, range.to + 1);
  }
  if (limit !== null) {
    nextRows = nextRows.slice(0, limit);
  }
  return nextRows;
}

function getTableRows(db: MockDb, table: string): Record<string, unknown>[] {
  switch (table) {
    case "lesson_progress":
      return db.lesson_progress.map((row) => ({ ...row }));
    case "quiz_attempts":
      return db.quiz_attempts.map((row) => ({ ...row }));
    case "achievements":
      return db.achievements.map((row) => ({ ...row }));
    case "streaks":
      return db.streaks.map((row) => ({ ...row }));
    case "profiles":
      return db.profiles.map((row) => ({ ...row }));
    case "daily_log":
      return db.daily_log.map((row) => ({ ...row }));
    case "notifications":
      return db.notifications.map((row) => ({ ...row }));
    default:
      return [];
  }
}

function toRowInputs(values: unknown) {
  if (Array.isArray(values)) {
    return values
      .map((value) => asRecord(value))
      .filter((value): value is Record<string, unknown> => value !== null);
  }

  const record = asRecord(values);
  return record ? [record] : [];
}

function parseLessonProgressInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeLessonProgressRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      completed: typeof input.completed === "boolean" ? input.completed : true,
      completed_at:
        typeof input.completed_at === "string" || input.completed_at === null
          ? input.completed_at
          : createTimestamp(),
      time_spent_seconds:
        typeof input.time_spent_seconds === "number" ? input.time_spent_seconds : DEFAULT_TIME_SPENT_SECONDS,
    },
    getFallbackUserId(db),
    0
  );
}

function parseQuizAttemptInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeQuizAttemptRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      attempted_at: typeof input.attempted_at === "string" ? input.attempted_at : createTimestamp(),
    },
    getFallbackUserId(db),
    0
  );
}

function parseAchievementInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeAchievementRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      earned_at: typeof input.earned_at === "string" ? input.earned_at : createTimestamp(),
    },
    getFallbackUserId(db),
    0
  );
}

function parseStreakInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeStreakRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      updated_at: typeof input.updated_at === "string" ? input.updated_at : createTimestamp(),
    },
    getFallbackUserId(db)
  );
}

function parseProfileInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeProfileRow(
    {
      ...input,
      id: typeof input.id === "string" ? input.id : db.auth.account.id,
      updated_at: typeof input.updated_at === "string" ? input.updated_at : createTimestamp(),
    },
    createProfileFromAccount(db.auth.account)
  );
}

function parseDailyLogInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeDailyLogRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      created_at: typeof input.created_at === "string" ? input.created_at : createTimestamp(),
    },
    getFallbackUserId(db),
    0
  );
}

function parseNotificationInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeNotificationRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      created_at: typeof input.created_at === "string" ? input.created_at : createTimestamp(),
      read: typeof input.read === "boolean" ? input.read : false,
    },
    getFallbackUserId(db),
    0
  );
}

function applyMutation(
  db: MockDb,
  table: string,
  mutation: QueryMutation,
  filters: QueryFilter[]
): { rows: Record<string, unknown>[]; changed: boolean } {
  const inputs = toRowInputs(mutation.values);

  switch (table) {
    case "lesson_progress": {
      const rows: Record<string, unknown>[] = [];
      for (const input of inputs) {
        const nextRow = parseLessonProgressInput(db, input);
        if (!nextRow) continue;

        const existingIndex = db.lesson_progress.findIndex(
          (row) => row.user_id === nextRow.user_id && row.lesson_id === nextRow.lesson_id
        );

        if (mutation.kind === "insert" && existingIndex >= 0) {
          rows.push({ ...db.lesson_progress[existingIndex] });
          continue;
        }

        if (existingIndex >= 0) {
          const existing = db.lesson_progress[existingIndex];
          db.lesson_progress[existingIndex] = {
            ...existing,
            ...nextRow,
            id: existing.id,
            created_at: existing.created_at,
            updated_at: createTimestamp(),
          };
          rows.push({ ...db.lesson_progress[existingIndex] });
        } else {
          db.lesson_progress.push(nextRow);
          rows.push({ ...nextRow });
        }
      }
      return { rows, changed: rows.length > 0 };
    }

    case "quiz_attempts": {
      const rows: Record<string, unknown>[] = [];
      for (const input of inputs) {
        const nextRow = parseQuizAttemptInput(db, input);
        if (!nextRow) continue;

        if (mutation.kind === "upsert") {
          const existingIndex = db.quiz_attempts.findIndex(
            (row) => row.user_id === nextRow.user_id && row.quiz_id === nextRow.quiz_id
          );
          if (existingIndex >= 0) {
            const existing = db.quiz_attempts[existingIndex];
            db.quiz_attempts[existingIndex] = {
              ...existing,
              ...nextRow,
              id: existing.id,
            };
            rows.push({ ...db.quiz_attempts[existingIndex] });
            continue;
          }
        }

        db.quiz_attempts.push(nextRow);
        rows.push({ ...nextRow });
      }
      return { rows, changed: rows.length > 0 };
    }

    case "achievements": {
      const rows: Record<string, unknown>[] = [];
      for (const input of inputs) {
        const nextRow = parseAchievementInput(db, input);
        if (!nextRow) continue;

        const existing = db.achievements.find(
          (row) => row.user_id === nextRow.user_id && row.achievement_id === nextRow.achievement_id
        );

        if (existing) continue;

        db.achievements.push(nextRow);
        rows.push({ ...nextRow });
      }
      return { rows, changed: rows.length > 0 };
    }

    case "streaks": {
      const input = inputs[0];
      if (!input) return { rows: [], changed: false };

      const nextRow = parseStreakInput(db, input);
      if (!nextRow) return { rows: [], changed: false };

      const existingIndex = db.streaks.findIndex((row) => row.user_id === nextRow.user_id);
      if (existingIndex >= 0) {
        db.streaks[existingIndex] = {
          ...db.streaks[existingIndex],
          ...nextRow,
          updated_at: createTimestamp(),
        };
      } else {
        db.streaks.push(nextRow);
      }

      const row = db.streaks.find((item) => item.user_id === nextRow.user_id);
      return { rows: row ? [{ ...row }] : [], changed: Boolean(row) };
    }

    case "profiles": {
      if (mutation.kind === "delete") return { rows: [], changed: false };

      if (mutation.kind === "update") {
        const rows: Record<string, unknown>[] = [];
        for (const profile of db.profiles) {
          if (!applyFilters([{ ...profile }], filters).length) continue;

          if (typeof mutation.values === "object" && mutation.values) {
            const updates = mutation.values as Record<string, unknown>;
            if (typeof updates.display_name === "string" || updates.display_name === null) {
              profile.display_name = updates.display_name as string | null;
            }
            if (typeof updates.avatar_url === "string" || updates.avatar_url === null) {
              profile.avatar_url = updates.avatar_url as string | null;
            }
            profile.updated_at = createTimestamp();
            if (profile.id === db.auth.account.id && typeof profile.display_name === "string") {
              db.auth.account.display_name = profile.display_name;
            }
          }
          rows.push({ ...profile });
        }
        return { rows, changed: rows.length > 0 };
      }

      const input = inputs[0];
      if (!input) return { rows: [], changed: false };
      const nextRow = parseProfileInput(db, input);
      if (!nextRow) return { rows: [], changed: false };

      const existingIndex = db.profiles.findIndex((row) => row.id === nextRow.id);
      if (existingIndex >= 0) {
        db.profiles[existingIndex] = {
          ...db.profiles[existingIndex],
          ...nextRow,
          updated_at: createTimestamp(),
        };
      } else {
        db.profiles.push(nextRow);
      }
      if (nextRow.id === db.auth.account.id && typeof nextRow.display_name === "string") {
        db.auth.account.display_name = nextRow.display_name;
      }
      const row = db.profiles.find((item) => item.id === nextRow.id);
      return { rows: row ? [{ ...row }] : [], changed: Boolean(row) };
    }

    case "daily_log": {
      const rows: Record<string, unknown>[] = [];
      for (const input of inputs) {
        const nextRow = parseDailyLogInput(db, input);
        if (!nextRow) continue;

        const existing = db.daily_log.find(
          (row) => row.user_id === nextRow.user_id && row.activity_date === nextRow.activity_date
        );
        if (existing) {
          rows.push({ ...existing });
          continue;
        }

        db.daily_log.push(nextRow);
        rows.push({ ...nextRow });
      }
      return { rows, changed: rows.length > 0 };
    }

    case "notifications": {
      if (mutation.kind === "insert" || mutation.kind === "upsert") {
        const rows: Record<string, unknown>[] = [];
        for (const input of inputs) {
          const nextRow = parseNotificationInput(db, input);
          if (!nextRow) continue;
          db.notifications.push(nextRow);
          rows.push({ ...nextRow });
        }
        return { rows, changed: rows.length > 0 };
      }

      if (mutation.kind === "update") {
        const rows: Record<string, unknown>[] = [];
        for (const notification of db.notifications) {
          if (!applyFilters([{ ...notification }], filters).length) continue;

          if (typeof mutation.values === "object" && mutation.values) {
            const updates = mutation.values as Record<string, unknown>;
            if (typeof updates.read === "boolean") notification.read = updates.read;
            if (typeof updates.title === "string") notification.title = updates.title;
            if (typeof updates.body === "string") notification.body = updates.body;
            if (typeof updates.type === "string") notification.type = updates.type;
          }

          rows.push({ ...notification });
        }
        return { rows, changed: rows.length > 0 };
      }

      if (mutation.kind === "delete") {
        const before = db.notifications.length;
        db.notifications = db.notifications.filter(
          (notification) => !applyFilters([{ ...notification }], filters).length
        );
        return { rows: [], changed: db.notifications.length !== before };
      }

      return { rows: [], changed: false };
    }

    default:
      return { rows: [], changed: false };
  }
}

function createQueryBuilder(table: string, cookieStore?: CookieStore) {
  const filters: QueryFilter[] = [];
  let order: QueryOrder | null = null;
  let range: QueryRange | null = null;
  let limitCount: number | null = null;
  let mutation: QueryMutation | null = null;
  let selectedColumns: string[] | null = null;
  let selectOptions: SelectOptions = {};
  let shouldReturnRows = false;

  const execute = (single: boolean) => {
    const db = getMockDb(cookieStore);

    if (mutation) {
      const { rows, changed } = applyMutation(db, table, mutation, filters);
      if (changed) {
        saveMockDb(db, cookieStore);
      }

      const filteredRows = applyRange(applyOrdering(rows, order), range, limitCount);
      const projectedRows = projectRows(filteredRows, selectedColumns);
      const count = selectOptions.count ? rows.length : null;

      return Promise.resolve({
        data: single
          ? (projectedRows[0] ?? null)
          : shouldReturnRows
            ? selectOptions.head
              ? null
              : projectedRows
            : null,
        error: null,
        count,
      });
    }

    const rawRows = applyFilters(getTableRows(db, table), filters);
    const count = selectOptions.count ? rawRows.length : null;
    const filteredRows = applyRange(applyOrdering(rawRows, order), range, limitCount);
    const projectedRows = projectRows(filteredRows, selectedColumns);

    return Promise.resolve({
      data: single ? (projectedRows[0] ?? null) : selectOptions.head ? null : projectedRows,
      error: null,
      count,
    });
  };

  const builder = {
    select(columns?: string, options?: SelectOptions) {
      selectedColumns = parseSelectedColumns(columns);
      selectOptions = options ?? {};
      if (mutation) shouldReturnRows = true;
      return builder;
    },
    eq(column: string, value: unknown) {
      filters.push({ type: "eq", column, value });
      return builder;
    },
    gte(column: string, value: unknown) {
      filters.push({ type: "gte", column, value });
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      order = { column, ascending: options?.ascending ?? true };
      return builder;
    },
    limit(count: number) {
      limitCount = count;
      return builder;
    },
    range(from: number, to: number) {
      range = { from, to };
      return builder;
    },
    not(column: string, operator: string, value: unknown) {
      filters.push({ type: "not", column, operator, value });
      return builder;
    },
    is(column: string, value: unknown) {
      filters.push({ type: "is", column, value });
      return builder;
    },
    in(column: string, values: unknown[]) {
      filters.push({ type: "in", column, value: values });
      return builder;
    },
    upsert(values: unknown, options?: unknown) {
      mutation = { kind: "upsert", values, options };
      return builder;
    },
    insert(values: unknown, options?: unknown) {
      mutation = { kind: "insert", values, options };
      return builder;
    },
    update(values: unknown, options?: unknown) {
      mutation = { kind: "update", values, options };
      return builder;
    },
    delete(options?: unknown) {
      mutation = { kind: "delete", options };
      return builder;
    },
    single() {
      return execute(true);
    },
    maybeSingle() {
      return execute(true);
    },
    then(
      onfulfilled?: (value: { data: unknown; error: null; count: number | null }) => unknown,
      onrejected?: (reason: unknown) => unknown
    ) {
      return execute(false).then(onfulfilled as any, onrejected);
    },
  };

  return builder;
}

const authSubscribers = new Set<(event: AuthChangeEvent, session: Session | null) => void>();

function emitAuthStateChange(event: AuthChangeEvent, session: Session | null) {
  authSubscribers.forEach((callback) => {
    try {
      callback(event, session);
    } catch {}
  });
}

export interface SelectOptions {
  head?: boolean;
  count?: "exact" | "planned" | "estimated";
}

export function getMockSupabaseClient(cookieStore?: CookieStore): SupabaseClient<Database, "public", any> {
  return {
    supabaseUrl: "https://placeholder.supabase.co",
    auth: {
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
    },
    from(table: string) {
      return createQueryBuilder(table, cookieStore);
    },
    rpc(fn: string) {
      if (fn === "delete_user") {
        const nextDb = cloneDefaultDb();
        saveMockDb(nextDb, cookieStore);
        emitAuthStateChange("SIGNED_OUT", null);
        return Promise.resolve({ data: null, error: null });
      }

      return Promise.resolve({ data: null, error: null });
    },
  } as unknown as SupabaseClient<Database, "public", any>;
}
