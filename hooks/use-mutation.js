import { useCallback, useState } from "react";

// Hook para ações de escrita (login, criar evento, etc.).
// `mutate(...args)` resolve com o resultado ou relança o ApiError.
export function useMutation(fn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setLoading(false);
        return result;
      } catch (err) {
        setError(err);
        setLoading(false);
        throw err;
      }
    },
    [fn],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}
