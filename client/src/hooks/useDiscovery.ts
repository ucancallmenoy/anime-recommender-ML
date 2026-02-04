import { useCallback, useState } from "react";

import { fetchDiscovery } from "../services/api";
import type { AnimeResult, DiscoverRequest } from "../types/anime";

export function useDiscovery() {
  const [results, setResults] = useState<AnimeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiscovery = useCallback(async (payload: DiscoverRequest) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDiscovery(payload);
      setResults(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    runDiscovery,
    clearResults: () => {
      setResults([]);
      setError(null);
    },
  };
}
