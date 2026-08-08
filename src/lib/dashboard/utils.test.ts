import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logQueryError } from "./utils";
import type { PostgrestError } from "@supabase/supabase-js";
import { logger } from "../logger";

describe("dashboard utils", () => {
  beforeEach(() => {
    vi.spyOn(logger, "error").mockImplementation(() => {});
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

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith("Query error in TestContext:", mockError);
    });

    it("should not log anything when error is null", () => {
      logQueryError("TestContext", null);

      expect(logger.error).not.toHaveBeenCalled();
    });
  });
});
