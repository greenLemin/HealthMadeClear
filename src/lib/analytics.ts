// Privacy: No PII is sent to analytics. User IDs, email addresses, and search queries are excluded.

import { logger } from "./logger";

type EventProperties = Record<string, string | number | boolean>;

const EVENTS = {
  LESSON_STARTED: "lesson_started",
  LESSON_COMPLETED: "lesson_completed",
  QUIZ_STARTED: "quiz_started",
  QUIZ_COMPLETED: "quiz_completed",
  LEARNING_PATH_STARTED: "learning_path_started",
  LEARNING_PATH_COMPLETED: "learning_path_completed",
  ACHIEVEMENT_EARNED: "achievement_earned",
  SEARCH_PERFORMED: "search_performed",
  AUTH_SIGNUP: "auth_signup",
  AUTH_LOGIN: "auth_login",
} as const;

export function trackPageView(url: string, _locale: string): void {
  logger.log("[Analytics] Page view:", url, _locale);

  if (process.env.NODE_ENV === "development") return;

  if (typeof window !== "undefined") {
    // Prefer the caller-supplied URL (stripped to pathname) so SPA navigations
    // report the navigated-to page even if location hasn't committed yet.
    // Strip query/hash to prevent PII leakage (e.g., ?code=oauth_code).
    let pagePath = window.location.pathname;
    let pageLocation = window.location.origin + window.location.pathname;
    try {
      const parsed = new URL(url, window.location.origin);
      pagePath = parsed.pathname;
      pageLocation = parsed.origin + parsed.pathname;
    } catch {
      // Malformed URL — fall back to current location.
    }

    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_location: pageLocation,
        page_path: pagePath,
        locale: _locale,
      });
    }
  }
}

export function trackEvent(event: string, _properties?: EventProperties): void {
  logger.log("[Analytics] Event:", event, _properties);

  if (process.env.NODE_ENV === "development") return;

  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, _properties || {});
    }
  }
}

export { EVENTS };
