import { useState, useCallback } from 'react';

export function useAsyncAction<T, Args extends any[]>(
  action: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await action(...args);
        setLoading(false);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
        return null;
      }
    },
    [action]
  );

  return { execute, loading, error };
}
