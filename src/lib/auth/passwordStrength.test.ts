import { describe, expect, it } from "vitest";
import { getPasswordStrength } from "./passwordStrength";

describe("getPasswordStrength", () => {
  it("returns default empty result for empty or falsy password", () => {
    expect(getPasswordStrength("")).toEqual({ label: "", color: "", width: "0%", value: 0 });
  });

  it("returns 'weak' for passwords with length less than PASSWORD_THRESHOLDS.WEAK (length < 6)", () => {
    expect(getPasswordStrength("12345")).toEqual({ label: "weak", color: "bg-error", width: "25%", value: 25 });
  });

  it("returns 'fair' for passwords with length between WEAK and FAIR threshold (6 <= length < 10)", () => {
    expect(getPasswordStrength("123456")).toEqual({ label: "fair", color: "bg-tertiary", width: "50%", value: 50 });
    expect(getPasswordStrength("123456789")).toEqual({ label: "fair", color: "bg-tertiary", width: "50%", value: 50 });
  });

  it("returns 'good' for passwords with length between FAIR and GOOD threshold (10 <= length < 14)", () => {
    expect(getPasswordStrength("1234567890")).toEqual({ label: "good", color: "bg-secondary", width: "75%", value: 75 });
    expect(getPasswordStrength("1234567890123")).toEqual({ label: "good", color: "bg-secondary", width: "75%", value: 75 });
  });

  it("returns 'strong' for passwords with length greater than or equal to PASSWORD_THRESHOLDS.GOOD (length >= 14)", () => {
    expect(getPasswordStrength("12345678901234")).toEqual({ label: "strong", color: "bg-secondary", width: "100%", value: 100 });
    expect(getPasswordStrength("12345678901234567890")).toEqual({ label: "strong", color: "bg-secondary", width: "100%", value: 100 });
  });
});
