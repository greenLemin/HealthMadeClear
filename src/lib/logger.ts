export type LogMethod = "log" | "warn" | "error" | "info" | "debug";

export const logIfDev = <T extends unknown[]>(methodOrFn: LogMethod | ((...args: T) => void)) => {
  return (...args: T) => {
    if (process.env.NODE_ENV === "development") {
      if (typeof methodOrFn === "string") {
        console[methodOrFn](...args);
      } else {
        methodOrFn(...args);
      }
    }
  };
};

function reportErrorInProduction(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") return;
  if (typeof window === "undefined") return;
  const error = args.find((a) => a instanceof Error) ?? new Error(String(args[0] ?? "Unknown error"));
  void import("./errorReporting").then(({ reportClientError }) => {
    reportClientError(error, { source: "logger.error" });
  });
}

export const logger = {
  log: logIfDev("log"),
  warn: logIfDev("warn"),
  error: (...args: unknown[]) => {
    logIfDev("error")(...args);
    reportErrorInProduction(...args);
  },
  info: logIfDev("info"),
  debug: logIfDev("debug"),
};
