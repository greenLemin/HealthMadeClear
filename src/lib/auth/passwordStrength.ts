export const PASSWORD_THRESHOLDS = {
  WEAK: 8,
  FAIR: 10,
  GOOD: 14,
} as const;

export interface PasswordStrength {
  label: string;
  color: string;
  width: string;
  value: number;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { label: "", color: "", width: "0%", value: 0 };
  if (password.length < PASSWORD_THRESHOLDS.WEAK)
    return { label: "weak", color: "bg-error", width: "25%", value: 25 };
  if (password.length < PASSWORD_THRESHOLDS.FAIR)
    return { label: "fair", color: "bg-tertiary", width: "50%", value: 50 };
  if (password.length < PASSWORD_THRESHOLDS.GOOD)
    return { label: "good", color: "bg-secondary", width: "75%", value: 75 };
  return { label: "strong", color: "bg-secondary", width: "100%", value: 100 };
}
