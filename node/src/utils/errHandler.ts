export const withErrorHandling = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (err) {
      throw new Error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
};
