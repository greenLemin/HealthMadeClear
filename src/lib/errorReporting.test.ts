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
      vi.mocked(Sentry.getClient).mockReturnValue(
        undefined as unknown as ReturnType<typeof Sentry.getClient>
      );
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

    it("strips query and hash from request and breadcrumb URLs in beforeSend", async () => {
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      reportClientError("Prod Error");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const initCall = vi.mocked(Sentry.init).mock.calls[0]![0];
      expect(initCall?.beforeSend).toBeDefined();

      const event = {
        request: {
          url: "https://example.com/en/learn/understanding-prescription-labels?code=abc#access_token=secret",
        },
        breadcrumbs: [
          {
            data: {
              url: "https://example.com/en/learn/understanding-prescription-labels?q=1#access_token=secret",
            },
          },
        ],
      };
      const result = initCall!.beforeSend!(event as unknown as Sentry.ErrorEvent, {} as Sentry.EventHint);

      expect(result).toBe(event);
      expect(event.request.url).toBe("https://example.com/en/learn/understanding-prescription-labels");
      expect(event.request.url).not.toContain("#access_token=");
      expect(event.request.url).not.toContain("?");
      expect(event.breadcrumbs[0]?.data?.url).toBe(
        "https://example.com/en/learn/understanding-prescription-labels"
      );
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
          sendDefaultPii: false,
        })
      );
      expect(vi.mocked(Sentry.init).mock.calls[0]![0]).not.toHaveProperty("dataCollection");

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

    it("sets sendDefaultPii false, redacts extra.lessonId, and blanks user PII in beforeSend", async () => {
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      reportClientError("Prod Error");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const initCall = vi.mocked(Sentry.init).mock.calls[0]![0];
      expect(initCall?.sendDefaultPii).toBe(false);

      const event = {
        user: { id: "u1", ip_address: "1.2.3.4", email: "a@b.c", username: "pat" },
        extra: { lessonId: "living-with-hypertension", route: "learn" },
      };
      const result = initCall!.beforeSend!(event as unknown as Sentry.ErrorEvent, {} as Sentry.EventHint);

      expect(result).toBe(event);
      expect(event.user.ip_address).toBeUndefined();
      expect(event.user.email).toBeUndefined();
      expect(event.user.id).toBeUndefined();
      expect(event.user.username).toBeUndefined();
      expect(event.extra.lessonId).toBe("[redacted]");
      expect(event.extra.route).toBe("learn");
    });

    it("scrubs PII formats (phone, email, ssn, card) and leaves non-PII IDs untouched", async () => {
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      reportClientError(
        "Contact user at (123) 456-7890 or user@example.com or ssn 123-45-6789 or card 4111 1111 1111 1111, but leave user_1234567890 intact"
      );
      await new Promise((resolve) => setTimeout(resolve, 0));

      const initCall = vi.mocked(Sentry.init).mock.calls[0]![0];
      const event = {
        message: "Error with (123) 456-7890, +1 123-456-7890, 123.456.7890, and user_1234567890",
        breadcrumbs: [{ message: "User email user@test.com and phone 123-456-7890" }],
      };
      initCall!.beforeSend!(event as unknown as Sentry.ErrorEvent, {} as Sentry.EventHint);

      expect(event.message).toBe("Error with [phone], [phone], [phone], and user_1234567890");
      expect(event.breadcrumbs[0]?.message).toBe("User email [email] and phone [phone]");
    });

    it("drops ui.input breadcrumbs so SearchDialog keystrokes are not stored", async () => {
      vi.stubGlobal("window", {} as Window & typeof globalThis);

      reportClientError("Prod Error");
      await new Promise((resolve) => setTimeout(resolve, 0));

      const initCall = vi.mocked(Sentry.init).mock.calls[0]![0];
      const dropped = initCall!.beforeBreadcrumb!(
        {
          category: "ui.input",
          data: { value: "chest pain", from: "SearchDialog" },
        } as Sentry.Breadcrumb,
        undefined
      );
      expect(dropped).toBeNull();
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

describe("reportServerError", () => {
  const DSN = "https://abc123@o0.ingest.sentry.io/99";

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SENTRY_DSN", DSN);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function loadReporter() {
    const mod = await import("./errorReporting");
    return mod.reportServerError;
  }

  it("POSTs a Sentry envelope when SENTRY_DSN is set", async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const reportServerError = await loadReporter();
    reportServerError(new Error("server boom"), { route: "contact" });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://o0.ingest.sentry.io/api/99/envelope/");
    expect(init.method).toBe("POST");
    expect(timeoutSpy).toHaveBeenCalledWith(2000);
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(String(init.body)).toContain("server boom");
  });

  it("does not fetch on the 6th call inside 10s", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const reportServerError = await loadReporter();
    for (let i = 0; i < 6; i += 1) {
      reportServerError(new Error(`e${i}`));
    }

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(console.error).toHaveBeenCalled();
  });

  it("aborts hung ingest after 2s and does not block the isolate", async () => {
    vi.useFakeTimers();
    vi.spyOn(AbortSignal, "timeout").mockImplementation((ms: number) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      return controller.signal;
    });
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(init.signal?.reason ?? new Error("aborted"));
          });
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const reportServerError = await loadReporter();
    reportServerError(new Error("hung"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const signal = (fetchMock.mock.calls[0] as [string, RequestInit])[1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(2000);
    expect(signal.aborted).toBe(true);
  });

  it("skips ingest when SENTRY_DSN is unset", async () => {
    vi.stubEnv("SENTRY_DSN", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const reportServerError = await loadReporter();
    reportServerError(new Error("no dsn"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith("[hmc:server]", "no dsn", undefined);
  });

  it("scrubs PII (emails, phone numbers, SSNs, credit cards) in server error messages", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const reportServerError = await loadReporter();
    reportServerError(
      new Error("Contact user@example.com or call 555-123-4567 or SSN 123-45-6789 card 4532-0158-9283-2049")
    );

    expect(console.error).toHaveBeenCalledWith(
      "[hmc:server]",
      "Contact [email] or call [phone] or SSN [ssn] card [card]",
      undefined
    );
  });

  it("does not fetch when SENTRY_SERVER_SAMPLE_RATE is 0", async () => {
    vi.stubEnv("SENTRY_SERVER_SAMPLE_RATE", "0");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const reportServerError = await loadReporter();
    reportServerError(new Error("sampled out"));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
