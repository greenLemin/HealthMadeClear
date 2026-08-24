import type { MockDb, QueryFilter, QueryMutation } from "../types";
import { applyFilters } from "./filters";
import { asRecord, createMockId, createTimestamp } from "../utils";
import {
  toRowInputs,
  parseLessonProgressInput,
  parseQuizAttemptInput,
  parseAchievementInput,
  parseStreakInput,
  parseProfileInput,
  parseDailyLogInput,
  parseNotificationInput,
} from "./inputs";

export function applyMutation(
  db: MockDb,
  table: string,
  mutation: QueryMutation,
  filters: QueryFilter[]
): { rows: Record<string, unknown>[]; changed: boolean; error: { message: string; code: string } | null } {
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
          return {
            rows: [],
            changed: false,
            error: {
              message:
                'duplicate key value violates unique constraint "lesson_progress_user_id_lesson_id_key"',
              code: "23505",
            },
          };
        }

        if (existingIndex >= 0) {
          const existing = db.lesson_progress[existingIndex]!;
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
      return { rows, changed: rows.length > 0, error: null };
    }

    case "quiz_attempts": {
      const rows: Record<string, unknown>[] = [];
      for (const input of inputs) {
        const nextRow = parseQuizAttemptInput(db, input);
        if (!nextRow) continue;

        const existingIndex = db.quiz_attempts.findIndex(
          (row) => row.user_id === nextRow.user_id && row.quiz_id === nextRow.quiz_id
        );

        if (mutation.kind === "insert" && existingIndex >= 0) {
          return {
            rows: [],
            changed: false,
            error: {
              message: 'duplicate key value violates unique constraint "quiz_attempts_user_id_quiz_id_key"',
              code: "23505",
            },
          };
        }

        if (mutation.kind === "upsert") {
          if (existingIndex >= 0) {
            const existing = db.quiz_attempts[existingIndex]!;
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
      return { rows, changed: rows.length > 0, error: null };
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
      return { rows, changed: rows.length > 0, error: null };
    }

    case "streaks": {
      const input = inputs[0];
      if (!input) return { rows: [], changed: false, error: null };

      const nextRow = parseStreakInput(db, input);
      if (!nextRow) return { rows: [], changed: false, error: null };

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
      return { rows: row ? [{ ...row }] : [], changed: Boolean(row), error: null };
    }

    case "profiles": {
      if (mutation.kind === "delete") return { rows: [], changed: false, error: null };

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
        return { rows, changed: rows.length > 0, error: null };
      }

      const input = inputs[0];
      if (!input) return { rows: [], changed: false, error: null };
      const nextRow = parseProfileInput(db, input);
      if (!nextRow) return { rows: [], changed: false, error: null };

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
      return { rows: row ? [{ ...row }] : [], changed: Boolean(row), error: null };
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
      return { rows, changed: rows.length > 0, error: null };
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
        return { rows, changed: rows.length > 0, error: null };
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
        return { rows, changed: rows.length > 0, error: null };
      }

      if (mutation.kind === "delete") {
        const before = db.notifications.length;
        db.notifications = db.notifications.filter(
          (notification) => !applyFilters([{ ...notification }], filters).length
        );
        return { rows: [], changed: db.notifications.length !== before, error: null };
      }

      return { rows: [], changed: false, error: null };
    }

    case "contact_submissions": {
      if (mutation.kind === "insert" || mutation.kind === "upsert") {
        const rows: Record<string, unknown>[] = [];
        for (const input of inputs) {
          const rec = asRecord(input);
          if (
            !rec ||
            typeof rec.name !== "string" ||
            typeof rec.email !== "string" ||
            typeof rec.message !== "string"
          )
            continue;
          const row = {
            id: typeof rec.id === "string" ? rec.id : createMockId("contact"),
            name: rec.name,
            email: rec.email,
            subject: typeof rec.subject === "string" ? rec.subject : "general",
            message: rec.message,
            created_at: createTimestamp(),
          };
          db.contact_submissions.push(row as unknown as (typeof db.contact_submissions)[number]);
          rows.push({ ...row });
        }
        return { rows, changed: rows.length > 0, error: null };
      }
      return { rows: [], changed: false, error: null };
    }

    default:
      return { rows: [], changed: false, error: null };
  }
}
