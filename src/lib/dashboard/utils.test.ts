import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logQueryError } from "./utils";
import type { PostgrestError } from "@supabase/supabase-js";

describe("dashboard utils", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("logQueryError", () => {
    it("should log an error when PostgrestError is provided", () => {
      const mockError = {
        name: "PostgrestError",
        message: "Test error",
        details: "Test details",
        hint: "Test hint",
        code: "500",
      } as PostgrestError;

      logQueryError("TestContext", mockError);

      expect(console.error).toHaveBeenCalledTimes(1);
      // logQueryError now delegates to reportServerError which scrubs and prefixes with [hmc:server]
      const [prefix, , context] = (console.error as unknown as { mock: { calls: unknown[][] } }).mock
        .calls[0] as [string, string, Record<string, unknown>];
      expect(prefix).toBe("[hmc:server]");
      expect(context).toMatchObject({ context: "TestContext" });
    });

    it("should not log anything when error is null", () => {
      logQueryError("TestContext", null);

      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
