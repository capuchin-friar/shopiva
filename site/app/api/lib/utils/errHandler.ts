/**
 * Error Handler Utility
 * 
 * Wraps async functions with error handling.
 * 
 * @module app/api/lib/utils/errHandler
 */

type AsyncFunction = (...args: any[]) => Promise<any>;

export const withErrorHandling = <T extends AsyncFunction>(fn: T): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (err) {
      throw new Error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }) as T;
};

