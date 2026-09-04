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

export const logger = {
  log: logIfDev("log"),
  warn: logIfDev("warn"),
  error: logIfDev("error"),
  info: logIfDev("info"),
  debug: logIfDev("debug"),
};
