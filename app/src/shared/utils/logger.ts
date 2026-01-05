const isDev = import.meta.env.DEV;

/**
 * Conditional logger that only outputs in development mode
 * In production, only errors are logged
 */
export const logger = {
  /**
   * General logging - only in development
   */
  log: (...args: any[]) => {
    if (isDev) console.log(...args);
  },

  /**
   * Warning messages - only in development
   */
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },

  /**
   * Error messages - always logged (production + development)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Debug messages - only in development
   */
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  },

  /**
   * Info messages - only in development
   */
  info: (...args: any[]) => {
    if (isDev) console.info(...args);
  },
};
