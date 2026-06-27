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
      expect(console.error).toHaveBeenCalledWith("Query error in TestContext:", mockError);
    });

    it("should not log anything when error is null", () => {
      logQueryError("TestContext", null);

      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
