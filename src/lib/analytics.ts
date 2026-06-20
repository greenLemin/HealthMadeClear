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

export function trackPageView(_url: string, _locale: string): void {
  logger.log("[Analytics] Page view:", _url, _locale);
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.gtag &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ) {
    window.gtag("event", "page_view", {
      page_location: window.location.href,
      page_path: _url,
      locale: _locale,
    });
  }
}

export function trackEvent(event: string, _properties?: EventProperties): void {
  logger.log("[Analytics] Event:", event, _properties);
  if (
    process.env.NODE_ENV === "production" &&
    typeof window !== "undefined" &&
    window.gtag &&
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  ) {
    window.gtag("event", event, _properties || {});
  }
}

export { EVENTS };
