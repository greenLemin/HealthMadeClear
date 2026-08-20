import { describe, expect, it } from "vitest";
import { getPasswordStrength, PASSWORD_THRESHOLDS } from "./passwordStrength";

describe("getPasswordStrength", () => {
  it("returns empty values when password is empty", () => {
    expect(getPasswordStrength("")).toEqual({
      label: "",
      color: "",
      width: "0%",
      value: 0,
    });
  });

  it("returns weak rating when password length is below WEAK threshold", () => {
    const password = "a".repeat(PASSWORD_THRESHOLDS.WEAK - 1);
    expect(getPasswordStrength(password)).toEqual({
      label: "weak",
      color: "bg-error",
      width: "25%",
      value: 25,
    });
  });

  it("returns fair rating when password length is between WEAK and FAIR thresholds", () => {
    const password = "a".repeat(PASSWORD_THRESHOLDS.WEAK);
    expect(getPasswordStrength(password)).toEqual({
      label: "fair",
      color: "bg-tertiary",
      width: "50%",
      value: 50,
    });
  });

  it("returns good rating when password length is between FAIR and GOOD thresholds", () => {
    const password = "a".repeat(PASSWORD_THRESHOLDS.FAIR);
    expect(getPasswordStrength(password)).toEqual({
      label: "good",
      color: "bg-secondary",
      width: "75%",
      value: 75,
    });
  });

  it("returns strong rating when password length meets or exceeds GOOD threshold", () => {
    const password = "a".repeat(PASSWORD_THRESHOLDS.GOOD);
    expect(getPasswordStrength(password)).toEqual({
      label: "strong",
      color: "bg-secondary",
      width: "100%",
      value: 100,
    });
  });
});
