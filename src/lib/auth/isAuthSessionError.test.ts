import { describe, expect, it } from "vitest";
import { isAuthSessionError } from "./isAuthSessionError";

describe("isAuthSessionError", () => {
  it("returns false for non-object errors", () => {
    expect(isAuthSessionError(null)).toBe(false);
    expect(isAuthSessionError(undefined)).toBe(false);
    expect(isAuthSessionError("error")).toBe(false);
    expect(isAuthSessionError(123)).toBe(false);
  });

  it("returns true for status 401", () => {
    expect(isAuthSessionError({ status: 401 })).toBe(true);
    expect(isAuthSessionError({ statusCode: 401 })).toBe(true);
    expect(isAuthSessionError({ status: "401" })).toBe(true);
  });

  it("returns true for auth error codes", () => {
    expect(isAuthSessionError({ code: "PGRST301" })).toBe(true);
    expect(isAuthSessionError({ code: "jwt_expired" })).toBe(true);
    expect(isAuthSessionError({ code: "session_expired" })).toBe(true);
    expect(isAuthSessionError({ code: "invalid_jwt" })).toBe(true);
    expect(isAuthSessionError({ code: "401" })).toBe(true);
    expect(isAuthSessionError({ code: "invalid_grant" })).toBe(true);
    expect(isAuthSessionError({ code: "AuthSessionMissingError" })).toBe(true);
  });

  it("returns true for auth error names", () => {
    expect(isAuthSessionError({ name: "AuthSessionMissingError" })).toBe(true);
    expect(isAuthSessionError({ name: "AuthApiError" })).toBe(true);
  });

  it("returns true for messages containing session / JWT keywords", () => {
    expect(isAuthSessionError({ message: "JWT expired" })).toBe(true);
    expect(isAuthSessionError({ message: "Invalid JWT token" })).toBe(true);
    expect(isAuthSessionError({ message: "Auth session missing!" })).toBe(true);
    expect(isAuthSessionError({ message: "User session has expired" })).toBe(true);
    expect(isAuthSessionError({ message: "The token is expired" })).toBe(true);
    expect(isAuthSessionError({ message: "Unauthorized access" })).toBe(true);
    expect(isAuthSessionError({ message: "refresh_token_not_found" })).toBe(true);
    expect(isAuthSessionError({ error_description: "Invalid token supplied" })).toBe(true);
  });

  it("returns false for generic errors", () => {
    expect(isAuthSessionError({ message: "Network connection lost" })).toBe(false);
    expect(isAuthSessionError({ message: "duplicate key value violates unique constraint" })).toBe(false);
    expect(isAuthSessionError({ code: "23505" })).toBe(false);
    expect(isAuthSessionError({ status: 500, message: "Internal server error" })).toBe(false);
  });
});
