export const MOCK_RESET_CODE = "mock-reset";
export const MOCK_CONFIRM_CODE = "mock-confirm";
export const DEFAULT_ACCOUNT_ID = "00000000-0000-0000-0000-000000000000";
export const DEFAULT_TIME_SPENT_SECONDS = 60;

export function createTimestamp(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

export function createMockId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createMockAuthError(message: string) {
  return { message, name: "AuthApiError", status: 400 };
}

export function createMockUserId(email: string) {
  const normalized =
    email
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "mock-user";
  return `mock-${normalized}`;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

export function parseSelectedColumns(columns?: string): string[] | null {
  if (!columns || columns.trim() === "" || columns.trim() === "*") return null;
  return columns
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);
}

export function parseFirstJsonObject<T = unknown>(str: string): T {
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
