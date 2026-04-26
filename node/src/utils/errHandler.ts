export const withErrorHandling = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Error: ${msg}`, { cause: err });
    }
  };
};
