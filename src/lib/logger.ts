type LogMethod = "log" | "warn" | "error";

const logIfDev = (method: LogMethod) => {
  return (...args: Parameters<(typeof console)[LogMethod]>) => {
    if (process.env.NODE_ENV === "development") {
      console[method](...args);
    }
  };
};

export const logger = {
  log: logIfDev("log"),
  warn: logIfDev("warn"),
  error: logIfDev("error"),
};
