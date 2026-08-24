import type { MockDb } from "../types";
import { DEFAULT_TIME_SPENT_SECONDS, asRecord, createMockId, createTimestamp } from "../utils";
import { createProfileFromAccount } from "../defaults";
import {
  normalizeAchievementRow,
  normalizeDailyLogRow,
  normalizeLessonProgressRow,
  normalizeNotificationRow,
  normalizeProfileRow,
  normalizeQuizAttemptRow,
  normalizeStreakRow,
} from "../normalizers";
import { getFallbackUserId } from "../store";

export function toRowInputs(values: unknown) {
  if (Array.isArray(values)) {
    return values
      .map((value) => asRecord(value))
      .filter((value): value is Record<string, unknown> => value !== null);
  }

  const record = asRecord(values);
  return record ? [record] : [];
}

export function getTableRows(db: MockDb, table: string): Record<string, unknown>[] {
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
    case "contact_submissions":
      return db.contact_submissions.map((row) => ({ ...(row as unknown as Record<string, unknown>) }));
    default:
      return [];
  }
}

export function parseLessonProgressInput(db: MockDb, input: Record<string, unknown>) {
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

export function parseQuizAttemptInput(db: MockDb, input: Record<string, unknown>) {
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

export function parseAchievementInput(db: MockDb, input: Record<string, unknown>) {
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

export function parseStreakInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeStreakRow(
    {
      ...input,
      user_id: typeof input.user_id === "string" ? input.user_id : getFallbackUserId(db),
      updated_at: typeof input.updated_at === "string" ? input.updated_at : createTimestamp(),
    },
    getFallbackUserId(db)
  );
}

export function parseProfileInput(db: MockDb, input: Record<string, unknown>) {
  return normalizeProfileRow(
    {
      ...input,
      id: typeof input.id === "string" ? input.id : db.auth.account.id,
      updated_at: typeof input.updated_at === "string" ? input.updated_at : createTimestamp(),
    },
    createProfileFromAccount(db.auth.account)
  );
}

export function parseDailyLogInput(db: MockDb, input: Record<string, unknown>) {
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

export function parseNotificationInput(db: MockDb, input: Record<string, unknown>) {
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

export { asRecord, createMockId };
