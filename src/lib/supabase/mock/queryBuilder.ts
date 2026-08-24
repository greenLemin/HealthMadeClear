import type {
  CookieStore,
  MockDb,
  QueryFilter,
  QueryMutation,
  QueryOrder,
  QueryRange,
  SelectOptions,
} from "./types";
import { parseSelectedColumns } from "./utils";
import { applyFilters } from "./queryBuilder/filters";
import { projectRows, applyOrdering, applyRange } from "./queryBuilder/transform";
import { getTableRows } from "./queryBuilder/inputs";
import { applyMutation } from "./queryBuilder/mutations";
import { getMockDb, saveMockDb } from "./store";

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

  private executeMutation(db: MockDb): {
    rows: Record<string, unknown>[];
    error: { message: string; code: string } | null;
  } {
    const { rows, changed, error } = applyMutation(db, this.table, this.mutation!, this.filters);
    if (changed) {
      saveMockDb(db, this.cookieStore);
    }
    return { rows, error };
  }

  private execute(single: boolean) {
    const db = getMockDb(this.cookieStore);
    let rows: Record<string, unknown>[] = [];
    let mutationError: { message: string; code: string } | null = null;

    if (this.mutation) {
      const result = this.executeMutation(db);
      rows = result.rows;
      mutationError = result.error;
    } else {
      rows = applyFilters(getTableRows(db, this.table), this.filters);
    }

    if (mutationError) {
      return Promise.resolve({ data: null, error: mutationError, count: null });
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
    onfulfilled?: (value: {
      data: unknown;
      error: { message: string; code: string } | null;
      count: number | null;
    }) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) {
    return this.execute(false).then(onfulfilled, onrejected);
  }
}

export function createQueryBuilder(table: string, cookieStore?: CookieStore) {
  return new MockQueryBuilder(table, cookieStore);
}
