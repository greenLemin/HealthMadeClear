// Privacy: No PII is sent to analytics. User IDs, email addresses, and search queries are excluded.

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
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Page view:", _url, _locale);
  }
  // TODO before launch: wire to GA4 gtag or Plausible
}

export function trackEvent(event: string, _properties?: EventProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Event:", event, _properties);
  }
  // TODO before launch: wire to GA4 gtag or Plausible
}

export { EVENTS };
