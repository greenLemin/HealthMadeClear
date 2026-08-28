type ErrorContext = Record<string, string | number | boolean | undefined>;

/**
 * Words that mark a context value as sensitive.
 *
 * Compared against the individual words of a key rather than as raw
 * substrings, so `apiKey` and `api_key` are caught while `monkey` and
 * `keyboard` are not.
 */
const SENSITIVE_WORDS = new Set([
  // storage and transport
  // "storage" on its own covers localStorage, sessionStorage and the
  // camel-case forms once the key is split into words.
  "storage",
  "localstorage",
  "sessionstorage",
  "cookie",
  "cookies",
  "session",
  // credentials
  "password",
  "passwd",
  "token",
  "secret",
  "credential",
  "credentials",
  "auth",
  "authorization",
  "key",
  "apikey",
  "bearer",
  "signature",
  // health and personal data
  "note",
  "notes",
  "phi",
  "email",
  "phone",
  "ssn",
  "dob",
  "birthdate",
  "birthday",
  "address",
]);

/** Splits `apiKey`, `api_key`, `API-KEY` and `PHI_data` into lowercase words. */
function toWords(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
}

function isSensitiveKey(key: string): boolean {
  return toWords(key).some((word) => SENSITIVE_WORDS.has(word));
}

const REDACTED = "[redacted]";

/**
 * Replaces sensitive values rather than dropping the keys. A missing key is
 * ambiguous during triage — you cannot tell whether it was never set or was
 * stripped — whereas an explicit marker preserves the shape of the context.
 */
function sanitizeContext(context?: ErrorContext): ErrorContext | undefined {
  if (!context) return undefined;
  const safe: ErrorContext = {};
  for (const key in context) {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      safe[key] = isSensitiveKey(key) ? REDACTED : context[key];
    }
  }
  return safe;
}

// PII patterns to scrub from error messages and stack traces before
// sending to Sentry. The patterns cover the most common accidental PII
// leaks: emails, phone numbers, SSNs, and credit card numbers.
const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Email addresses
  { pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, replacement: "[email]" },
  // US phone numbers (xxx) xxx-xxxx, xxx-xxx-xxxx, +1 xxx-xxx-xxxx
  { pattern: /(\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: "[phone]" },
  // SSN xxx-xx-xxxx
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: "[ssn]" },
  // Credit card numbers (13-19 digits, optionally space/dash separated)
  { pattern: /\b(?:\d[ -]*?){13,19}\b/g, replacement: "[card]" },
];

function scrubPII(text: string): string {
  let result = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

function stripUrlQueryAndHash(url: string): string {
  const cut = url.search(/[?#]/);
  return cut === -1 ? url : url.slice(0, cut);
}

function stripEventUrls(event: {
  request?: { url?: string };
  breadcrumbs?: Array<{ data?: { url?: unknown } }>;
}) {
  if (typeof event.request?.url === "string") {
    event.request.url = stripUrlQueryAndHash(event.request.url);
  }
  if (!event.breadcrumbs) return;
  for (const crumb of event.breadcrumbs) {
    if (crumb.data && typeof crumb.data.url === "string") {
      crumb.data.url = stripUrlQueryAndHash(crumb.data.url);
    }
  }
}

export function reportClientError(error: unknown, context?: ErrorContext) {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const safeContext = sanitizeContext(context);

  if (process.env.NODE_ENV === "development") {
    console.error("[hmc]", normalized, safeContext);
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || typeof window === "undefined") return;

  void import("@sentry/browser")
    .then((Sentry) => {
      if (!Sentry.getClient()) {
        Sentry.init({
          dsn,
          environment: process.env.NODE_ENV,
          beforeBreadcrumb(breadcrumb) {
            if (breadcrumb.category === "console") return null;
            return breadcrumb;
          },
          beforeSend(event) {
            stripEventUrls(event);
            // Scrub PII from error messages and stack traces
            if (event.message) {
              event.message = scrubPII(event.message);
            }
            if (event.exception?.values) {
              for (const ex of event.exception.values) {
                if (ex.value) ex.value = scrubPII(ex.value);
                if (ex.stacktrace?.frames) {
                  for (const frame of ex.stacktrace.frames) {
                    if (frame.filename) frame.filename = scrubPII(frame.filename);
                    if (frame.function) frame.function = scrubPII(frame.function);
                  }
                }
              }
            }
            return event;
          },
        });
      }
      Sentry.captureException(normalized, { extra: safeContext });
    })
    .catch(() => {
      /* optional monitoring */
    });
}

/** Server/API route errors — structured console logging; wire @sentry/nextjs for full capture (INF-002). */
export function reportServerError(error: unknown, context?: ErrorContext) {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const safeContext = sanitizeContext(context);
  const scrubbedMessage = scrubPII(normalized.message);
  console.error("[hmc:server]", scrubbedMessage, safeContext);
}
