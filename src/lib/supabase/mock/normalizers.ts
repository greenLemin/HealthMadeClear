import type {
  MockAccount,
  MockAchievementRow,
  MockContactSubmissionRow,
  MockDailyLogRow,
  MockDb,
  MockLessonProgressRow,
  MockNotificationRow,
  MockProfileRow,
  MockQuizAttemptRow,
  MockStreakRow,
} from "./types";
import { DEFAULT_TIME_SPENT_SECONDS, asRecord, createMockId, createTimestamp } from "./utils";
import { cloneDefaultAccount, cloneDefaultDb, createProfileFromAccount } from "./defaults";

export function normalizeMockAccount(value: unknown, fallback: MockAccount): MockAccount {
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

export function normalizeProfileRow(value: unknown, fallback: MockProfileRow): MockProfileRow | null {
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

export function normalizeLessonProgressRow(
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

export function normalizeQuizAttemptRow(
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

export function normalizeAchievementRow(
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

export function normalizeStreakRow(value: unknown, fallbackUserId: string): MockStreakRow | null {
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

export function normalizeDailyLogRow(
  value: unknown,
  fallbackUserId: string,
  index: number
): MockDailyLogRow | null {
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

export function normalizeNotificationRow(
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

export function normalizeLegacyLessonRows(raw: unknown, fallbackUserId: string): MockLessonProgressRow[] {
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

export function normalizeLegacyQuizRows(raw: unknown, fallbackUserId: string): MockQuizAttemptRow[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => normalizeQuizAttemptRow(item, fallbackUserId, index))
    .filter((row): row is MockQuizAttemptRow => row !== null);
}

export function syncProfileFromAccount(db: MockDb, account: MockAccount) {
  const existing = db.profiles.find((profile) => profile.id === account.id);
  if (existing) {
    existing.display_name = account.display_name;
    existing.created_at ||= account.created_at;
    existing.updated_at = createTimestamp();
    return;
  }

  db.profiles.push(createProfileFromAccount(account));
}

export function normalizeMockDb(value: unknown): MockDb {
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

  // contact_submissions is append-only via service_role — mock needs no complex normalization.
  const contactSubmissions: MockContactSubmissionRow[] = Array.isArray(record.contact_submissions)
    ? ((record.contact_submissions as unknown[]).filter((r) => {
        const row = asRecord(r);
        return row !== null && typeof row.email === "string";
      }) as MockContactSubmissionRow[])
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
    contact_submissions: contactSubmissions,
    auth: {
      account,
      current_user_id: currentUserId,
    },
  };

  syncProfileFromAccount(db, account);
  return db;
}
