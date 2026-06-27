export const logger = {
  log: (...args: Parameters<typeof console.log>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(...args);
    }
  },
  warn: (...args: Parameters<typeof console.warn>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(...args);
    }
  },
  error: (...args: Parameters<typeof console.error>) => {
    if (process.env.NODE_ENV === "development") {
      console.error(...args);
    }
  },
};
