import type { QueryOrder, QueryRange } from "../types";

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
