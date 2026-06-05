type ErrorContext = Record<string, string | number | boolean | undefined>;

const SENSITIVE_KEY_PATTERN = /localStorage|cookie|password|token|secret|note|phi/i;

function sanitizeContext(context?: ErrorContext): ErrorContext | undefined {
  if (!context) return undefined;
  const safe: ErrorContext = {};
  for (const key in context) {
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      if (SENSITIVE_KEY_PATTERN.test(key)) continue;
      safe[key] = context[key];
    }
  }
  return safe;
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
        });
      }
      Sentry.captureException(normalized, { extra: safeContext });
    })
    .catch(() => {
      /* optional monitoring */
    });
}
