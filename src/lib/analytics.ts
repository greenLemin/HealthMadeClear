// Privacy: No PII is sent to analytics. User IDs, email addresses, and search queries are excluded.

type EventProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: "event", action: string, params?: Record<string, any>) => void;
    plausible?: (event: string, options?: { props?: Record<string, any>; u?: string }) => void;
  }
}

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

  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_location: _url,
        language: _locale,
      });
    }
    if (typeof window.plausible === "function") {
      window.plausible("pageview", { u: _url });
    }
  }
}

export function trackEvent(event: string, _properties?: EventProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Event:", event, _properties);
  }

  if (typeof window !== "undefined") {
    if (typeof window.gtag === "function") {
      window.gtag("event", event, _properties);
    }
    if (typeof window.plausible === "function") {
      window.plausible(event, { props: _properties });
    }
  }
}

export { EVENTS };
