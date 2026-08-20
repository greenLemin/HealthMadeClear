import type {
  CookieStore,
  MockDb,
  QueryFilter,
  QueryMutation,
  QueryOrder,
  QueryRange,
  SelectOptions,
} from "./types";
import { DEFAULT_TIME_SPENT_SECONDS, asRecord, createTimestamp, parseSelectedColumns } from "./utils";
import { createProfileFromAccount } from "./defaults";
import {
  normalizeAchievementRow,
  normalizeDailyLogRow,
  normalizeLessonProgressRow,
  normalizeNotificationRow,
  normalizeProfileRow,
  normalizeQuizAttemptRow,
  normalizeStreakRow,
} from "./normalizers";
import { getFallbackUserId, getMockDb, saveMockDb } from "./store";

export function projectRows(rows: Record<string, unknown>[], columns: string[] | null) {
  if (!columns) return rows.map((row) => ({ ...row }));

  return rows.map((row) => {
    const projected: Record<string, unknown> = {};
    for (const column of columns) {
      projected[column] = row[column] ?? null;
    }
    return projected;
  });
}

export function matchesFilter(row: Record<string, unknown>, filter: QueryFilter) {
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

export function applyFilters(rows: Record<string, unknown>[], filters: QueryFilter[]) {
  return filters.reduce(
    (currentRows, filter) => currentRows.filter((row) => matchesFilter(row, filter)),
    rows
  );
}

export function applyOrdering(rows: Record<string, unknown>[], order: QueryOrder | null) {
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

export function applyRange(rows: Record<string, unknown>[], range: QueryRange | null, limit: number | null) {
  let nextRows = rows;
  if (range) {
    nextRows = nextRows.slice(range.from, range.to + 1);
  }
  if (limit !== null) {
    nextRows = nextRows.slice(0, limit);
  }
  return nextRows;
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
    default:
      return [];
  }
}

export function toRowInputs(values: unknown) {
  if (Array.isArray(values)) {
    return values
      .map((value) => asRecord(value))
      .filter((value): value is Record<string, unknown> => value !== null);
  }

  const record = asRecord(values);
  return record ? [record] : [];
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

export function applyMutation(
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

export class MockQueryBuilder {
  private filters: QueryFilter[] = [];
  private _order: QueryOrder | null = null;
  private _range: QueryRange | null = null;
  private limitCount: number | null = null;
  private mutation: QueryMutation | null = null;
  private selectedColumns: string[] | null = null;
  private selectOptions: SelectOptions = {};
  private shouldReturnRows = false;

  constructor(
    private table: string,
    private cookieStore?: CookieStore
  ) {}

  private executeMutation(db: MockDb) {
    const { rows, changed } = applyMutation(db, this.table, this.mutation!, this.filters);
    if (changed) {
      saveMockDb(db, this.cookieStore);
    }
    return rows;
  }

  private execute(single: boolean) {
    const db = getMockDb(this.cookieStore);
    let rows;

    if (this.mutation) {
      rows = this.executeMutation(db);
    } else {
      rows = applyFilters(getTableRows(db, this.table), this.filters);
    }

    const count = this.selectOptions.count ? rows.length : null;
    const filteredRows = applyRange(applyOrdering(rows, this._order), this._range, this.limitCount);
    const projectedRows = projectRows(filteredRows, this.selectedColumns);

    let data;
    if (single) {
      data = projectedRows[0] ?? null;
    } else if (this.mutation) {
      data = this.shouldReturnRows ? (this.selectOptions.head ? null : projectedRows) : null;
    } else {
      data = this.selectOptions.head ? null : projectedRows;
    }

    return Promise.resolve({ data, error: null, count });
  }

  select(columns?: string, options?: SelectOptions) {
    this.selectedColumns = parseSelectedColumns(columns);
    this.selectOptions = options ?? {};
    if (this.mutation) this.shouldReturnRows = true;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ type: "gte", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this._order = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this._range = { from, to };
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    this.filters.push({ type: "not", column, operator, value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ type: "is", column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ type: "in", column, value: values });
    return this;
  }

  upsert(values: unknown, options?: unknown) {
    this.mutation = { kind: "upsert", values, options };
    return this;
  }

  insert(values: unknown, options?: unknown) {
    this.mutation = { kind: "insert", values, options };
    return this;
  }

  update(values: unknown, options?: unknown) {
    this.mutation = { kind: "update", values, options };
    return this;
  }

  delete(options?: unknown) {
    this.mutation = { kind: "delete", options };
    return this;
  }

  single() {
    return this.execute(true);
  }

  maybeSingle() {
    return this.execute(true);
  }

  then(
    onfulfilled?: (value: { data: unknown; error: null; count: number | null }) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) {
    return this.execute(false).then(onfulfilled, onrejected);
  }
}

export function createQueryBuilder(table: string, cookieStore?: CookieStore) {
  return new MockQueryBuilder(table, cookieStore);
}
