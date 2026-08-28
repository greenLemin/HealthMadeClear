/**
 * Detects whether an error from Supabase / PostgREST / GoTrue represents an expired,
 * invalid, or missing auth session / JWT token (e.g. 401 / PGRST301 / AuthSessionMissingError).
 */
export function isAuthSessionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const err = error as Record<string, unknown>;

  // Check HTTP status code
  if (err.status === 401 || err.statusCode === 401 || err.status === "401") {
    return true;
  }

  // Check error codes
  const code = typeof err.code === "string" ? err.code.toLowerCase() : "";
  if (
    code === "pgrst301" ||
    code === "jwt_expired" ||
    code === "session_expired" ||
    code === "invalid_jwt" ||
    code === "401" ||
    code === "invalid_grant" ||
    code === "authsessionmissingerror" ||
    code === "authapierror"
  ) {
    return true;
  }

  // Check error name
  const name = typeof err.name === "string" ? err.name.toLowerCase() : "";
  if (name === "authsessionmissingerror" || name === "authapierror") {
    return true;
  }

  // Check message / description
  const message = typeof err.message === "string" ? err.message.toLowerCase() : "";
  const desc = typeof err.error_description === "string" ? err.error_description.toLowerCase() : "";
  const text = `${message} ${desc}`;

  return (
    text.includes("jwt") ||
    text.includes("session") ||
    text.includes("token is expired") ||
    text.includes("expired token") ||
    text.includes("token expired") ||
    text.includes("invalid token") ||
    text.includes("unauthorized") ||
    text.includes("not authenticated") ||
    text.includes("auth session missing") ||
    text.includes("refresh_token_not_found")
  );
}
