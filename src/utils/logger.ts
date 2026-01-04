/**
 * Production-safe logging utility
 * Only logs in development mode
 */

export const logger = {
  log: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    // Warnings are kept in production for important notices
    console.warn(...args);
  },
  error: (...args: any[]) => {
    // Errors are always logged
    console.error(...args);
  },
};

