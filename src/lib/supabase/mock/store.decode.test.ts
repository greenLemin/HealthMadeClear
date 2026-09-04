import { describe, it, expect } from "vitest";
import { decodeMockCookieValue, getMockDb } from "./store";

describe("decodeMockCookieValue", () => {
  it("decodes full encoded JSON containing commas (no truncation)", () => {
    const db = {
      auth: { current_user_id: "user-1", account: { id: "user-1" } },
    };
    const encoded = encodeURIComponent(JSON.stringify(db));
    expect(encoded).toContain("%");
    // Encoded commas are %2C — raw "," split would truncate.
    const decoded = decodeMockCookieValue(encoded);
    expect(JSON.parse(decoded)).toEqual(db);
  });

  it("passes through raw JSON containing commas", () => {
    const raw = '{"a":1,"b":2}';
    expect(decodeMockCookieValue(raw)).toBe(raw);
  });
});

describe("getMockDb with comma-containing cookie", () => {
  it("returns authenticated mock session instead of default DB", () => {
    const accountId = "test-user-123";
    const db = {
      auth: {
        current_user_id: accountId,
        account: { id: accountId, email: "t@example.com", display_name: "T" },
      },
    };
    const encoded = encodeURIComponent(JSON.stringify(db));
    const cookieStore = { get: () => ({ value: encoded }) };
    const result = getMockDb(cookieStore as never);
    expect(result.auth.current_user_id).toBe(accountId);
  });
});
