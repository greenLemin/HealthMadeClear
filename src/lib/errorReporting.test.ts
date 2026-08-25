import { describe, expect, it, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { reportClientError } from "./errorReporting";
import * as Sentry from "@sentry/browser";

vi.mock("@sentry/browser", () => ({
  getClient: vi.fn(),
  init: vi.fn(),
  captureException: vi.fn(),
}));

describe("reportClientError", () => {
  const originalEnv = process.env;
  let consoleSpy: MockInstance;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("development mode", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    it("logs normalized string errors to console", () => {
      reportClientError("A string error");
      expect(consoleSpy).toHaveBeenCalledWith("[hmc]", expect.any(Error), undefined);
      expect((consoleSpy.mock.calls[0]?.[1] as Error)?.message).toBe("A string error");
    });

    it("logs Error instances to console", () => {
      const error = new Error("An error object");
      reportClientError(error);
      expect(consoleSpy).toHaveBeenCalledWith("[hmc]", error, undefined);
    });

    it("sanitizes context", () => {
      reportClientError("Error", {
        safe: "yes",
        password: "no",
        token: "no",
        mySecret: "no",
        PHI_data: "no",
        something_cookie: "no",
        localStorage_thing: "no",
      });
      expect(consoleSpy).toHaveBeenCalledWith("[hmc]", expect.any(Error), {
        safe: "yes",
        password: "[redacted]",
        token: "[redacted]",
        mySecret: "[redacted]",
        PHI_data: "[redacted]",
        something_cookie: "[redacted]",
        localStorage_thing: "[redacted]",
      });
    });

    it.each([
      "password",
      "passwd",
      "authToken",
      "Authorization",
      "apiKey",
      "api_key",
      "accessKey",
      "bearerToken",
      "signature",
      "credentials",
      "sessionId",
      "sessionStorage",
      "userEmail",
      "phoneNumber",
      "ssn",
      "dob",
      "homeAddress",
      "user_notes",
      "phi_record",
    ])("redacts %s", (key) => {
      reportClientError("Error", { [key]: "sensitive" });
      expect(consoleSpy).toHaveBeenCalledWith("[hmc]", expect.any(Error), { [key]: "[redacted]" });
    });

    it.each([
      "route",
      "digest",
      "phase",
      "context",
      "lessonId",
      "pathId",
      "userId",
      "errorCode",
      "attempts",
      "duration",
      // These read as sensitive to a naive substring match but are not.
      "monkey",
      "keyboard",
      "keyword",
    ])("keeps %s", (key) => {
      reportClientError("Error", { [key]: "diagnostic" });
      expect(consoleSpy).toHaveBeenCalledWith("[hmc]", expect.any(Error), { [key]: "diagnostic" });
    });

    it("handles undefined context", () => {
      reportClientError("Error", undefined);
      expect(consoleSpy).toHaveBeenCalledWith("[hmc]", expect.any(Error), undefined);
    });
  });

  describe("production mode", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://examplePublicKey@o0.ingest.sentry.io/0");
      vi.stubGlobal("window", globalThis.window);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("does nothing if DSN is missing", async () => {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      reportClientError("Error");
      await new Promise(process.nextTick);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("does nothing if window is undefined", async () => {
      vi.stubGlobal("window", undefined);
      reportClientError("Error");
      await new Promise(process.nextTick);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it("initializes Sentry and captures exception", async () => {
      // Simulate browser environment
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      reportClientError("Prod Error", { safe: "data", secret: "hidden" });

      // Wait for dynamic import to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(Sentry.init).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
          environment: "production",
        })
      );

      // Test the beforeBreadcrumb logic
      const initCall = vi.mocked(Sentry.init).mock.calls[0]![0];
      expect(initCall?.beforeBreadcrumb).toBeDefined();

      if (initCall?.beforeBreadcrumb) {
        expect(
          initCall.beforeBreadcrumb({ category: "console", message: "test" } as Sentry.Breadcrumb, undefined)
        ).toBeNull();
        expect(
          initCall.beforeBreadcrumb({ category: "ui", message: "click" } as Sentry.Breadcrumb, undefined)
        ).toEqual({
          category: "ui",
          message: "click",
        });
      }

      expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
        extra: { safe: "data", secret: "[redacted]" },
      });
    });

    it("does not initialize Sentry if client already exists", async () => {
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      // Mock that client already exists
      vi.mocked(Sentry.getClient).mockReturnValue({} as ReturnType<typeof Sentry.getClient>);

      reportClientError("Prod Error");

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(Sentry.init).not.toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("catches import errors silently", async () => {
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      // Mock the dynamic import failing
      vi.doMock("@sentry/browser", () => {
        throw new Error("Import failed");
      });

      reportClientError("Error");
      await new Promise(process.nextTick);
    });
  });
});
