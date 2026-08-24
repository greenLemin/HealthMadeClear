import type { QueryFilter } from "../types";

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
