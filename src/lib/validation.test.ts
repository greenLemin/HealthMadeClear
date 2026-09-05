import { describe, expect, it } from "vitest";
import { EMAIL_REGEX, isValidEmail } from "./validation";

describe("isValidEmail", () => {
  it("returns true for valid email addresses", () => {
    const validEmails = [
      "user@example.com",
      "user.name@example.com",
      "user+tag@example.co.uk",
      "user123@subdomain.domain.org",
      "a_b-c@domain.info",
    ];

    for (const email of validEmails) {
      expect(isValidEmail(email)).toBe(true);
    }
  });

  it("trims whitespace around valid email addresses", () => {
    expect(isValidEmail("   user@example.com   ")).toBe(true);
    expect(isValidEmail("\tuser@example.com\n")).toBe(true);
  });

  it("returns false for invalid email addresses", () => {
    const invalidEmails = [
      "",
      "   ",
      "invalidemail",
      "user@",
      "@example.com",
      "user@.com",
      "user@example",
      "user @example.com",
      "user@ example.com",
      "user@example .com",
      "user@@example.com",
      "user@domain@example.com",
    ];

    for (const email of invalidEmails) {
      expect(isValidEmail(email)).toBe(false);
    }
  });
});

describe("EMAIL_REGEX", () => {
  it("matches valid email patterns", () => {
    expect(EMAIL_REGEX.test("test@domain.com")).toBe(true);
  });

  it("fails on un-trimmed strings with leading or trailing whitespace", () => {
    expect(EMAIL_REGEX.test(" test@domain.com")).toBe(false);
    expect(EMAIL_REGEX.test("test@domain.com ")).toBe(false);
  });
});
