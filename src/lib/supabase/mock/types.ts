import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { Database } from "@/types/database";

export interface MockCookieStore {
  get(name: string): { name: string; value: string } | undefined | null;
  set?(name: string, value: string, options?: any): void;
}

export type CookieStore = ReadonlyRequestCookies | MockCookieStore;

export type MockProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type MockLessonProgressRow = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type MockQuizAttemptRow = Database["public"]["Tables"]["quiz_attempts"]["Row"];
export type MockAchievementRow = Database["public"]["Tables"]["achievements"]["Row"];
export type MockStreakRow = Database["public"]["Tables"]["streaks"]["Row"];
export type MockDailyLogRow = Database["public"]["Tables"]["daily_log"]["Row"];
export type MockNotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export type MockAccount = {
  id: string;
  email: string;
  password: string;
  display_name: string;
  confirmed: boolean;
  pending_reset_code: string | null;
  pending_confirm_code: string | null;
  created_at: string;
};

export type MockAuthState = {
  account: MockAccount;
  current_user_id: string | null;
};

export type MockDb = {
  lesson_progress: MockLessonProgressRow[];
  quiz_attempts: MockQuizAttemptRow[];
  achievements: MockAchievementRow[];
  streaks: MockStreakRow[];
  profiles: MockProfileRow[];
  daily_log: MockDailyLogRow[];
  notifications: MockNotificationRow[];
  auth: MockAuthState;
};

export type QueryFilter =
  | { type: "eq"; column: string; value: unknown }
  | { type: "gte"; column: string; value: unknown }
  | { type: "is"; column: string; value: unknown }
  | { type: "in"; column: string; value: unknown[] }
  | { type: "not"; column: string; operator: string; value: unknown };

export type QueryOrder = {
  column: string;
  ascending: boolean;
};

export type QueryRange = {
  from: number;
  to: number;
};

export type QueryMutation = {
  kind: "insert" | "upsert" | "update" | "delete";
  values?: unknown;
  options?: unknown;
};

export interface SelectOptions {
  head?: boolean;
  count?: "exact" | "planned" | "estimated";
}
