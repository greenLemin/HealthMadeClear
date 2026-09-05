export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.(?:[a-zA-Z]{2,}|xn--[a-zA-Z0-9-]+)$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}
