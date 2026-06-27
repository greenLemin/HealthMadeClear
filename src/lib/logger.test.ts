import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "./logger";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("when NODE_ENV is development", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
    });

    it("should call console.log with provided arguments", () => {
      const args = ["test message", { data: 123 }];
      logger.log(...args);
      expect(console.log).toHaveBeenCalledWith(...args);
    });

    it("should call console.warn with provided arguments", () => {
      const args = ["warning message", { warning: true }];
      logger.warn(...args);
      expect(console.warn).toHaveBeenCalledWith(...args);
    });

    it("should call console.error with provided arguments", () => {
      const args = ["error message", new Error("test")];
      logger.error(...args);
      expect(console.error).toHaveBeenCalledWith(...args);
    });
  });

  describe("when NODE_ENV is not development", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
    });

    it("should not call console.log", () => {
      logger.log("test message");
      expect(console.log).not.toHaveBeenCalled();
    });

    it("should not call console.warn", () => {
      logger.warn("warning message");
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not call console.error", () => {
      logger.error("error message");
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
