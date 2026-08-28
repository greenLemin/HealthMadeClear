import { describe, expect, it } from "vitest";
import { getLocaleFromPathname, isOtpType, loginErrorUrl, recoveryRedirect } from "./parseAuthRedirect";

describe("getLocaleFromPathname", () => {
  it("reads the first segment when it is en or es", () => {
    expect(getLocaleFromPathname("/es/auth/confirm")).toBe("es");
    expect(getLocaleFromPathname("/en/auth/callback")).toBe("en");
  });

  it("defaults to en when the first segment is missing or not a locale", () => {
    expect(getLocaleFromPathname("/auth/confirm")).toBe("en");
    expect(getLocaleFromPathname("/")).toBe("en");
    expect(getLocaleFromPathname("")).toBe("en");
  });
});

describe("isOtpType", () => {
  it("accepts allowlisted types", () => {
    expect(isOtpType("signup")).toBe(true);
    expect(isOtpType("recovery")).toBe(true);
    expect(isOtpType("email_change")).toBe(true);
  });

  it("rejects unknown types", () => {
    expect(isOtpType("foo")).toBe(false);
    expect(isOtpType(null)).toBe(false);
    expect(isOtpType("")).toBe(false);
  });
});

describe("loginErrorUrl / recoveryRedirect", () => {
  it("builds locale-prefixed login error URLs", () => {
    expect(loginErrorUrl("http://localhost", "es", "confirmation_failed")).toBe(
      "http://localhost/es/auth/login?error=confirmation_failed"
    );
  });

  it("builds the recovery reset-password path", () => {
    expect(recoveryRedirect("es")).toBe("/es/auth/reset-password");
  });
});
