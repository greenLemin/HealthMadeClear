// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { trackPageView, trackEvent, EVENTS } from "./analytics";
import { logger } from "./logger";

describe("Analytics", () => {
  let gtagMock: Mock;

  beforeEach(() => {
    gtagMock = vi.fn();
    window.gtag = gtagMock;
    vi.spyOn(logger, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    delete window.gtag;
  });

  describe("trackPageView", () => {
    it("logs the page view but does not call trackers in development environment", () => {
      vi.stubEnv("NODE_ENV", "development");

      trackPageView("/test-path", "en");

      expect(logger.log).toHaveBeenCalledWith("[Analytics] Page view:", "/test-path", "en");
      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("calls gtag in production environment", () => {
      vi.stubEnv("NODE_ENV", "production");

      const url = "/about";
      const locale = "fr";

      trackPageView(url, locale);

      expect(gtagMock).toHaveBeenCalledWith("event", "page_view", {
        page_location: window.location.href,
        page_path: url,
        locale: locale,
      });
    });

    it("does not throw if gtag is not present on window", () => {
      vi.stubEnv("NODE_ENV", "production");
      delete window.gtag;

      expect(() => trackPageView("/test", "en")).not.toThrow();
    });
  });

  describe("trackEvent", () => {
    it("logs the event but does not call trackers in development environment", () => {
      vi.stubEnv("NODE_ENV", "development");
      const props = { test: true };

      trackEvent(EVENTS.LESSON_STARTED, props);

      expect(logger.log).toHaveBeenCalledWith("[Analytics] Event:", EVENTS.LESSON_STARTED, props);
      expect(gtagMock).not.toHaveBeenCalled();
    });

    it("calls gtag in production environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      const props = { test: true, score: 10 };

      trackEvent(EVENTS.QUIZ_COMPLETED, props);

      expect(gtagMock).toHaveBeenCalledWith("event", EVENTS.QUIZ_COMPLETED, props);
    });

    it("handles missing properties correctly", () => {
      vi.stubEnv("NODE_ENV", "production");

      trackEvent(EVENTS.AUTH_LOGIN);

      expect(gtagMock).toHaveBeenCalledWith("event", EVENTS.AUTH_LOGIN, {});
    });

    it("does not throw if gtag is not present on window", () => {
      vi.stubEnv("NODE_ENV", "production");
      delete window.gtag;

      expect(() => trackEvent(EVENTS.LESSON_COMPLETED)).not.toThrow();
    });
  });
});
